import type {
    BondEvent,
    Commitment,
    CommitmentSnapshot,
    Match,
    MatchAdvanced,
    MatchBisectionSnapshot,
    MatchSealedSnapshot,
    MatchSnapshot,
    Tournament,
    TournamentSnapshot,
} from "@cartesi/client";
import { keccak256, toHex, zeroHash, type Address, type Hash } from "viem";
import type { PartialBondRefundEvent } from "../lib/bondUtils";

const defaultDate = new Date("2026-01-01T00:00:00.000Z");
const defaultTournamentAddress: Address =
    "0xA2835312696Afa86c969e40831857dbB1412627f";
const defaultSubmitter: Address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const defaultTxHash: Hash =
    "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70";

type MatchSnapshotCommon = Pick<
    MatchSnapshot,
    "asOfBlock" | "timeoutOutcome" | "deferredCharge"
>;

type MatchSnapshotPhase = MatchSnapshot extends infer S
    ? S extends MatchSnapshot
        ? Omit<S, keyof MatchSnapshotCommon>
        : never
    : never;

type WithSnapshot<T extends { snapshot: unknown }, S> = Partial<
    Omit<T, "snapshot">
> & { snapshot?: S };

export const createTournamentSnapshot = (
    overrides: Partial<TournamentSnapshot> = {},
): TournamentSnapshot => ({
    asOfBlock: 100n,
    standing: "MATCHES_ACTIVE",
    acceptsJoins: false,
    candidate: null,
    winnerCommitment: null,
    finalStateHash: null,
    parentCommitment: null,
    finishedAtBlock: 0n,
    winnerExpiresAt: 0n,
    innerResult: null,
    bondRecovery: {
        disposition: "TOURNAMENT_RUNNING",
        claimer: null,
        payment: null,
    },
    ...overrides,
});

export const createTournament = (
    overrides: WithSnapshot<Tournament, Partial<TournamentSnapshot>> = {},
): Tournament => {
    const { snapshot, ...rest } = overrides;
    return {
        epochIndex: 0n,
        address: defaultTournamentAddress,
        parentTournamentAddress: null,
        parentMatchIdHash: null,
        maxLevel: 3n,
        level: 0n,
        log2step: 44n,
        height: 48n,
        createdAt: defaultDate,
        updatedAt: defaultDate,
        initialHash: zeroHash,
        baseCycle: 0n,
        kind: "NON_LEAF",
        startInstant: 1n,
        allowance: 1000n,
        creationEvent: null,
        ...rest,
        snapshot: createTournamentSnapshot(snapshot),
    };
};

export const createBisection = (
    overrides: Partial<Omit<MatchBisectionSnapshot, "currentHeight">> = {},
): Omit<MatchBisectionSnapshot, "currentHeight"> => ({
    revealingParent: zeroHash,
    waitingLeft: zeroHash,
    waitingRight: zeroHash,
    segmentStartPosition: 0n,
    segmentStartCycle: 0n,
    responder: "ONE",
    ...overrides,
});

export const createMatchSnapshot = (
    overrides: Partial<MatchSnapshotCommon> & Partial<MatchSnapshotPhase> = {},
): MatchSnapshot =>
    ({
        asOfBlock: 100n,
        timeoutOutcome: "NONE",
        deferredCharge: 0n,
        phase: "UNINITIALIZED",
        bisection: null,
        sealed: null,
        ...overrides,
    }) as MatchSnapshot;

export const createMatch = (
    overrides: WithSnapshot<Match, MatchSnapshot> = {},
): Match => {
    const { snapshot, ...rest } = overrides;
    const commitmentOne = rest.commitmentOne ?? keccak256(toHex(1));
    const commitmentTwo = rest.commitmentTwo ?? keccak256(toHex(2));
    const deletionReason = rest.deletionReason ?? "NOT_DELETED";
    return {
        epochIndex: 0n,
        tournamentAddress: defaultTournamentAddress,
        idHash: keccak256(`${commitmentOne}${commitmentTwo.slice(2)}`),
        commitmentOne,
        commitmentTwo,
        leftOfTwo: keccak256(toHex(3)),
        blockNumber: 1n,
        txHash: defaultTxHash,
        winnerCommitment: "NONE",
        deletionReason,
        deletionBlockNumber: null,
        deletionTxHash: null,
        createdAt: defaultDate,
        updatedAt: defaultDate,
        logIndex: 0n,
        eliminableAt: 0n,
        leafSeal: null,
        deletionLogIndex: null,
        ...rest,
        snapshot:
            snapshot ??
            (deletionReason === "NOT_DELETED"
                ? createMatchSnapshot({
                      phase: "BISECTING",
                      bisection: { ...createBisection(), currentHeight: 48n },
                      sealed: null,
                  })
                : createMatchSnapshot()),
    };
};

/**
 * Derive the snapshot of a match after the given advances: the height left,
 * the segment start and the responder by parity, and the ready-to-seal phase
 * once the segment holds two leaves. With `sealed`, the match is sealed at the
 * last segment start, or at the next leaf when `right` is set.
 */
export const createMatchState = (
    options: {
        tournament: Tournament;
        advances: MatchAdvanced[];
        sealed?: { right?: boolean } & Partial<MatchSealedSnapshot>;
    } & Partial<MatchSnapshotCommon>,
): MatchSnapshot => {
    const { tournament, advances, sealed, ...common } = options;
    const count = BigInt(advances.length);
    const position = advances[advances.length - 1]?.segmentStartPosition ?? 0n;
    const toCycle = (leaf: bigint) =>
        tournament.baseCycle + (leaf << tournament.log2step);

    if (sealed) {
        const { right = false, ...values } = sealed;
        const divergencePosition = position + (right ? 1n : 0n);
        return createMatchSnapshot({
            ...common,
            phase: "SEALED",
            bisection: null,
            sealed: {
                agreeState: keccak256(toHex("agree")),
                divergencePosition,
                divergenceCycle: toCycle(divergencePosition),
                finalStateOne: keccak256(toHex("one")),
                finalStateTwo: keccak256(toHex("two")),
                ...values,
            },
        });
    }

    const bisection = createBisection({
        segmentStartPosition: position,
        segmentStartCycle: toCycle(position),
        responder: count % 2n === 0n ? "ONE" : "TWO",
    });
    const currentHeight = tournament.height - count;
    return currentHeight > 1n
        ? createMatchSnapshot({
              ...common,
              phase: "BISECTING",
              bisection: { ...bisection, currentHeight },
              sealed: null,
          })
        : createMatchSnapshot({
              ...common,
              phase: "READY_TO_SEAL",
              bisection: { ...bisection, currentHeight: null },
              sealed: null,
          });
};

export const createCommitmentSnapshot = (
    overrides: Partial<CommitmentSnapshot> = {},
): CommitmentSnapshot => ({
    asOfBlock: 100n,
    claimer: defaultSubmitter,
    clockRunning: false,
    clockDeadline: 0n,
    clockAllowance: 1000n,
    ...overrides,
});

export const createCommitment = (
    overrides: WithSnapshot<Commitment, Partial<CommitmentSnapshot>> = {},
): Commitment => {
    const { snapshot, ...rest } = overrides;
    return {
        epochIndex: 0n,
        tournamentAddress: defaultTournamentAddress,
        commitment: keccak256(toHex(1)),
        finalStateHash: zeroHash,
        submitterAddress: defaultSubmitter,
        blockNumber: 1n,
        txHash: defaultTxHash,
        createdAt: defaultDate,
        updatedAt: defaultDate,
        logIndex: 0n,
        ...rest,
        snapshot: createCommitmentSnapshot(snapshot),
    };
};

export const createMatchAdvanced = (
    overrides: Partial<MatchAdvanced> = {},
): MatchAdvanced => ({
    epochIndex: 0n,
    tournamentAddress: defaultTournamentAddress,
    idHash: zeroHash,
    otherParent: zeroHash,
    leftNode: zeroHash,
    blockNumber: 1n,
    txHash: defaultTxHash,
    createdAt: defaultDate,
    updatedAt: defaultDate,
    logIndex: 0n,
    segmentStartPosition: 0n,
    eliminableAt: 0n,
    ...overrides,
});

type BondEventCommon = Omit<BondEvent, "type" | "refund" | "recovery">;

type BondEventPayload = BondEvent extends infer E
    ? E extends BondEvent
        ? Omit<E, keyof BondEventCommon>
        : never
    : never;

export const createBondEvent = (
    overrides: Partial<BondEventCommon> & Partial<BondEventPayload> = {},
): BondEvent =>
    ({
        epochIndex: 0n,
        tournamentAddress: defaultTournamentAddress,
        blockNumber: 1n,
        txHash: defaultTxHash,
        logIndex: 1n,
        createdAt: defaultDate,
        updatedAt: defaultDate,
        type: "PARTIAL_BOND_REFUND",
        refund: {
            recipient: defaultSubmitter,
            value: 1_000_000_000_000_000n,
            success: true,
        },
        recovery: null,
        ...overrides,
    }) as BondEvent;

/**
 * Build the partial refunds a match timeline joins by transaction hash, one
 * per transaction. Every `failEvery`-th refund is recorded as not paid.
 */
export const createRefunds = (
    txHashes: (Hash | null | undefined)[],
    failEvery = 0,
): Map<Hash, PartialBondRefundEvent> =>
    new Map(
        txHashes
            .filter((txHash): txHash is Hash => !!txHash)
            .map((txHash, index) => [
                txHash,
                createBondEvent({
                    txHash,
                    logIndex: BigInt(index + 1),
                    refund: {
                        recipient: defaultSubmitter,
                        value:
                            1_200_000_000_000_000n + BigInt(index) * 10n ** 13n,
                        success:
                            failEvery === 0 || (index + 1) % failEvery !== 0,
                    },
                }) as PartialBondRefundEvent,
            ]),
    );
