import type { DeletionReason, WinnerCommitment } from "@cartesi/client";
import {
    iDaveConsensusAbi,
    iInputBoxAbi,
    iTournamentAbi,
    inputBoxAddress,
} from "@cartesi/client/abi";
import {
    concat,
    encodeFunctionData,
    getAbiItem,
    keccak256,
    stringToHex,
    toFunctionSelector,
    zeroHash,
    type Address,
    type Hash,
    type Hex,
} from "viem";
import { generateMatchID } from "../../../stories/util";
import {
    accounts,
    addressOf,
    assignLogIndexes,
    between,
    createChain,
    emit,
    hashOf,
    sendTx,
    type Chain,
    type LogRecord,
    type TxRecord,
} from "./chain";

export type Side = "ONE" | "TWO";

export type ClaimSpec = {
    /** Account that joins a root tournament. */
    account?: Address;
    /** Parent match side whose claimer joins an inner tournament. */
    side?: Side;
    honest?: boolean;
    /** Acts through a contract wallet instead of calling the tournament. */
    relayed?: boolean;
    /** The contract wallet rejects ETH, so its gas refunds are not paid. */
    rejectsRefunds?: boolean;
    /** Blocks after the tournament opens; staggered from 3 by default. */
    joinAt?: number;
};

export type MatchSpec = (
    | { end: "TIMEOUT"; winner: Side; advances: number }
    | { end: "ELIMINATED"; advances: number }
    | { end: "STEP"; winner: Side }
    | { end: "LEAF_TIMEOUT"; winner: Side }
    | { end: "CHILD_TOURNAMENT"; inner: TournamentSpec; unused?: boolean }
) & {
    /** A side that answers each move past the response budget. */
    slow?: Side;
};

export type TournamentSpec = {
    claims: ClaimSpec[];
    /** How each match ends, in the order the matches are created. */
    matches: MatchSpec[];
    /** Whether the winner recovers the bond; inner tournaments default to yes. */
    recovered?: boolean;
};

export type PrtScenarioSpec = {
    name: string;
    address: Address;
    inputs: number;
    /** The root tournament of epoch 1, the first epoch holding inputs. */
    root: TournamentSpec;
    /** Blocks after epoch 1's root opens where the session starts. */
    presentAt?: number;
};

/** Gas allocations from Dave's `Gas.sol`. */
const GAS = {
    tx: 25_000n,
    advance: 127_000n,
    winTimeout: 262_000n,
    eliminateTimeout: 135_000n,
    sealInner: 363_000n,
    winInner: 338_000n,
    eliminateInner: 172_000n,
    sealLeaf: 130_000n,
    winLeaf: 3_885_000n,
} as const;

const WORK_PRICE_CAP = 50_000_000_000n;

const max = (a: bigint, b: bigint) => (a > b ? a : b);

/** Dave's `Bond.bondValue`: the gas of a full match at the price cap. */
export const getBondValue = (height: bigint, leaf: boolean) => {
    const timeout = max(GAS.winTimeout, GAS.eliminateTimeout);
    const terminal = max(
        timeout,
        leaf
            ? GAS.sealLeaf + max(GAS.winLeaf, timeout)
            : GAS.sealInner + max(GAS.winInner, GAS.eliminateInner),
    );
    return (height * GAS.advance + terminal - GAS.advance) * WORK_PRICE_CAP;
};

export const LEVELS = [
    { log2step: 44n, height: 48n },
    { log2step: 27n, height: 17n },
    { log2step: 0n, height: 27n },
].map((level, index, levels) => ({
    ...level,
    bondValue: getBondValue(level.height, index === levels.length - 1),
}));

export const MAX_LEVEL = BigInt(LEVELS.length);
/** Dave's devnet deployment: one hour of 12-second blocks. */
export const MAX_ALLOWANCE = 300n;
/** Dave's devnet deployment: five minutes of 12-second blocks. */
export const RESPONSE_BUDGET = 25n;
export const CLAIM_STAGING_PERIOD = 12n;

export type ClockChange = {
    block: bigint;
    running: boolean;
    /** Allowance left at `block`. */
    allowance: bigint;
};

export type CommitmentRecord = {
    tournament: Address;
    commitment: Hash;
    /** Root children the commitment hashes, posted on join. */
    children: readonly [Hash, Hash];
    finalStateHash: Hash;
    submitter: Address;
    /** The account the tournament sees and refunds. */
    sender: Address;
    rejectsRefunds: boolean;
    honest: boolean;
    side: Side | null;
    joined: LogRecord;
    relayed: boolean;
    clock: ClockChange[];
    /** Block the claimer was cleared by elimination or bond recovery. */
    clearedAt: bigint | null;
};

export type AdvanceRecord = {
    log: LogRecord;
    segmentStartPosition: bigint;
    leftNode: Hash;
    otherParent: Hash;
    eliminableAt: bigint;
};

export type SealRecord = {
    log: LogRecord;
    leaf: boolean;
    divergencePosition: bigint;
    agreeState: Hash;
    finalStateOne: Hash;
    finalStateTwo: Hash;
    eliminableAt: bigint;
};

export type MatchEndRecord = {
    log: LogRecord;
    reason: Exclude<DeletionReason, "NOT_DELETED">;
    winner: WinnerCommitment;
};

export type MatchRecord = {
    tournament: Address;
    idHash: Hash;
    one: CommitmentRecord;
    two: CommitmentRecord;
    leftOfTwo: Hash;
    created: LogRecord;
    eliminableAt: bigint;
    divergenceCycle: bigint;
    advances: AdvanceRecord[];
    seal: SealRecord | null;
    end: MatchEndRecord;
    child: TournamentRecord | null;
};

export type BondEventRecord = { log: LogRecord; tournament: Address } & (
    | {
          type: "PARTIAL_BOND_REFUND";
          recipient: Address;
          value: bigint;
          success: boolean;
      }
    | {
          type: "BOND_RECOVERED";
          commitment: Hash;
          claimer: Address;
          payment: bigint;
          burned: bigint;
      }
);

export type TournamentRecord = {
    address: Address;
    epochIndex: bigint;
    level: bigint;
    log2step: bigint;
    height: bigint;
    allowance: bigint;
    bondValue: bigint;
    baseCycle: bigint;
    initialHash: Hash;
    parent: { address: Address; matchIdHash: Hash } | null;
    created: LogRecord;
    closesAt: bigint;
    finishedAt: bigint;
    winner: CommitmentRecord | null;
    /** Expiry of an inner winner, zero for the root. */
    expiresAt: bigint;
    /** Block the parent match used the inner winner. */
    consumedAt: bigint | null;
    commitments: CommitmentRecord[];
    matches: MatchRecord[];
    bondEvents: BondEventRecord[];
};

export type InputRecord = {
    index: bigint;
    epochIndex: bigint;
    log: LogRecord;
    sender: Address;
    payload: Hex;
    processedAt: bigint;
};

export type PrtEpochRecord = {
    index: bigint;
    /** The `EpochSealed` log that sealed the epoch and opened its root. */
    sealed: LogRecord;
    inputs: [bigint, bigint];
    root: TournamentRecord;
    nodeClaim: CommitmentRecord | null;
    staged: LogRecord | null;
    /** The acceptance, which also seals the next epoch. */
    accepted: LogRecord | null;
};

export type ApplicationStatusRecord = {
    status: "DIVERGED" | "FAILED";
    block: bigint;
    reason: string;
};

export type PrtTimeline = {
    name: string;
    address: Address;
    consensus: Address;
    anchor: bigint;
    inputs: InputRecord[];
    epochs: PrtEpochRecord[];
    /** Root tournament of the disputed epoch. */
    root: TournamentRecord;
    nodeClaim: CommitmentRecord | null;
    tournaments: TournamentRecord[];
    applicationStatus: ApplicationStatusRecord | null;
    txs: TxRecord[];
    endsAt: bigint;
};

type Context = Chain & {
    tournaments: TournamentRecord[];
    inputs: number;
};

type Claimant = {
    account: Address;
    honest: boolean;
    side: Side | null;
    relayed: boolean;
    rejectsRefunds: boolean;
};

type TournamentSetup = {
    level: number;
    epochIndex: bigint;
    address: Address;
    allowance: bigint;
    baseCycle: bigint;
    initialHash: Hash;
    parent: TournamentRecord["parent"];
    created: LogRecord;
    divergenceCycle: bigint | null;
    claimant: (claim: ClaimSpec) => Claimant;
};

/**
 * A claim's commitment, the hash of the root children it joins with.
 */
export const commitmentOf = (tournament: Address, key: string | number) => {
    const children = [
        hashOf(tournament, "commitment", key, "left"),
        hashOf(tournament, "commitment", key, "right"),
    ] as const;
    return { commitment: keccak256(concat(children)), children };
};

/** The machine state after an epoch; the empty epoch 0 keeps the template. */
export const machineAfter = (name: string, epochIndex: bigint) =>
    epochIndex === 0n
        ? hashOf(name, "template")
        : hashOf(name, epochIndex, "final", 0);

const lastChange = (clock: ClockChange[]) => clock[clock.length - 1];

/** Dave's `Clock.remainingAt`: zero at and after a running deadline. */
export const allowanceAt = (clock: ClockChange[], block: bigint) => {
    const change = [...clock].reverse().find((item) => item.block <= block);
    if (!change) return clock[0].allowance;
    if (!change.running) return change.allowance;
    const left = change.allowance - (block - change.block);
    return left > 0n ? left : 0n;
};

const startClock = (clock: ClockChange[], block: bigint) => {
    clock.push({ block, running: true, allowance: allowanceAt(clock, block) });
};

/** Dave's `pauseAfterResponseAt`: time within the budget is not charged. */
const respond = (clock: ClockChange[], block: bigint, name: string) => {
    const change = lastChange(clock);
    const elapsed = block - change.block;
    if (!change.running || elapsed >= change.allowance) {
        throw new Error(`${name}: response at ${block} after the deadline`);
    }
    const charged = elapsed > RESPONSE_BUDGET ? elapsed - RESPONSE_BUDGET : 0n;
    clock.push({
        block,
        running: false,
        allowance: change.allowance - charged,
    });
};

const pauseCharged = (clock: ClockChange[], block: bigint, charge: bigint) => {
    clock.push({
        block,
        running: false,
        allowance: allowanceAt(clock, block) - charge,
    });
};

const deadlineOf = (clock: ClockChange[]) => {
    const change = lastChange(clock);
    return change.block + change.allowance;
};

const matchId = (match: Pick<MatchRecord, "one" | "two">) => ({
    commitmentOne: match.one.commitment,
    commitmentTwo: match.two.commitment,
});

const randomCycle = (ctx: Context) => {
    const input = BigInt(Math.floor(ctx.rng() * ctx.inputs));
    const mcycle = BigInt(Math.floor(ctx.rng() * 2 ** 32));
    const ucycle = BigInt(Math.floor(ctx.rng() * 2 ** 20));
    return (input << 68n) | (mcycle << 20n) | ucycle;
};

export const getBondBalance = (tournament: TournamentRecord, block: bigint) => {
    const deposited = tournament.commitments
        .filter((commitment) => commitment.joined.tx.block <= block)
        .reduce((sum) => sum + tournament.bondValue, 0n);
    return tournament.bondEvents
        .filter((event) => event.log.tx.block <= block)
        .reduce((balance, event) => {
            if (event.type === "BOND_RECOVERED") {
                return balance - event.payment - event.burned;
            }
            return event.success ? balance - event.value : balance;
        }, deposited);
};

/** Dave's recovery payment: the whole balance up to one bond. */
export const getRecoveryPayment = (balance: bigint, bond: bigint) =>
    balance > bond ? bond + (balance - bond) / 10n : balance;

/**
 * Dave's refundable action: the measured gas at the transaction's price,
 * capped by the action's allocation and the pool balance.
 */
const refund = (
    ctx: Context,
    tournament: TournamentRecord,
    tx: TxRecord,
    gas: bigint,
    rejects = false,
) => {
    const used = (gas * between(ctx, 70, 100)) / 100n;
    const price = 1_000_000_000n + between(ctx, 0, 1_000) * 1_000_000n;
    const cap = gas * WORK_PRICE_CAP;
    const balance = getBondBalance(tournament, tx.block);
    const value = [used * price, cap, balance].reduce((a, b) =>
        a < b ? a : b,
    );
    tournament.bondEvents.push({
        log: emit(ctx, tx),
        tournament: tournament.address,
        type: "PARTIAL_BOND_REFUND",
        recipient: tx.to === tournament.address ? tx.from : tx.to,
        value,
        success: !rejects,
    });
};

const recoverBond = (
    ctx: Context,
    tournament: TournamentRecord,
    winner: CommitmentRecord,
    block: bigint,
) => {
    const tx = sendTx(
        ctx,
        block,
        winner.submitter,
        tournament.address,
        encodeFunctionData({
            abi: iTournamentAbi,
            functionName: "tryRecoveringBond",
        }),
    );
    const balance = getBondBalance(tournament, block);
    const payment = getRecoveryPayment(balance, tournament.bondValue);
    tournament.bondEvents.push({
        log: emit(ctx, tx),
        tournament: tournament.address,
        type: "BOND_RECOVERED",
        commitment: winner.commitment,
        claimer: winner.submitter,
        payment,
        burned: balance - payment,
    });
    winner.clearedAt = block;
};

/** Send a tournament call as a claimant, through its wallet when relayed. */
const sendAs = (
    ctx: Context,
    block: bigint,
    claimant: CommitmentRecord,
    input: Hex,
) => sendTx(ctx, block, claimant.submitter, claimant.sender, input);

const runMatch = (
    ctx: Context,
    tournament: TournamentRecord,
    one: CommitmentRecord,
    two: CommitmentRecord,
    created: LogRecord,
    spec: MatchSpec,
    inheritedCycle: bigint | null,
): MatchRecord => {
    const { height, log2step } = tournament;
    const idHash = generateMatchID(one.commitment, two.commitment);
    const divergenceCycle = inheritedCycle ?? randomCycle(ctx);
    const leaf = (divergenceCycle - tournament.baseCycle) >> log2step;
    const sides = { ONE: one, TWO: two };
    const other = (side: Side): Side => (side === "ONE" ? "TWO" : "ONE");
    const bothLeft = (block: bigint) =>
        allowanceAt(one.clock, block) + allowanceAt(two.clock, block);
    const delay = (side: Side) =>
        spec.slow === side ? between(ctx, 30, 45) : between(ctx, 2, 6);
    const refundTo = (tx: TxRecord, gas: bigint, mover?: CommitmentRecord) =>
        refund(ctx, tournament, tx, gas, mover?.rejectsRefunds ?? false);

    let block = created.tx.block;
    startClock(one.clock, block);
    const record: Omit<MatchRecord, "end"> = {
        tournament: tournament.address,
        idHash,
        one,
        two,
        leftOfTwo: hashOf(idHash, "leftOfTwo"),
        created,
        eliminableAt: block + bothLeft(block),
        divergenceCycle,
        advances: [],
        seal: null,
        child: null,
    };

    const moves =
        spec.end === "TIMEOUT" || spec.end === "ELIMINATED"
            ? BigInt(spec.advances)
            : height - 1n;
    if (moves > height - 1n) {
        throw new Error(`${ctx.name}: too many advances for height ${height}`);
    }

    let position = 0n;
    for (let i = 0n; i < moves; i++) {
        const side: Side = i % 2n === 0n ? "ONE" : "TWO";
        const mover = sides[side];
        block += delay(side);
        const shift = height - 1n - i;
        const right = ((leaf >> shift) & 1n) === 1n;
        if (right) position += 1n << shift;
        const leftNode = hashOf(idHash, "left", i);
        const rightNode = hashOf(idHash, "right", i);
        const tx = sendAs(
            ctx,
            block,
            mover,
            encodeFunctionData({
                abi: iTournamentAbi,
                functionName: "advanceMatch",
                args: [
                    matchId(record),
                    leftNode,
                    rightNode,
                    hashOf(idHash, "newLeft", i),
                    hashOf(idHash, "newRight", i),
                ],
            }),
        );
        const previous = record.advances[record.advances.length - 1];
        const log = emit(ctx, tx);
        respond(mover.clock, block, ctx.name);
        startClock(sides[other(side)].clock, block);
        record.advances.push({
            log,
            segmentStartPosition: position,
            leftNode,
            otherParent:
                i === 0n
                    ? record.leftOfTwo
                    : right
                      ? zeroHash
                      : (previous?.leftNode ?? zeroHash),
            eliminableAt: block + bothLeft(block),
        });
        refundTo(tx, GAS.advance, mover);
    }

    const responderSide: Side = moves % 2n === 0n ? "ONE" : "TWO";
    const responder = sides[responderSide];
    const waiting = sides[other(responderSide)];
    const deleteMatch = (
        tx: TxRecord,
        reason: MatchEndRecord["reason"],
        winner: WinnerCommitment,
        gas: bigint,
        sender?: CommitmentRecord,
    ): MatchRecord => {
        const end = { log: emit(ctx, tx), reason, winner };
        refundTo(tx, gas, sender);
        for (const side of ["ONE", "TWO"] as const) {
            if (winner !== side) sides[side].clearedAt = tx.block;
        }
        return { ...record, end };
    };

    if (spec.end === "TIMEOUT") {
        if (spec.winner === responderSide) {
            throw new Error(
                `${ctx.name}: after ${spec.advances} advances ${responderSide} responds and cannot win by timeout`,
            );
        }
        const deadline = deadlineOf(responder.clock);
        const at = deadline + between(ctx, 1, 3);
        const tx = sendAs(
            ctx,
            at,
            waiting,
            encodeFunctionData({
                abi: iTournamentAbi,
                functionName: "winMatchByTimeout",
                args: [matchId(record), ...waiting.children],
            }),
        );
        pauseCharged(waiting.clock, at, at - deadline);
        return deleteMatch(tx, "TIMEOUT", spec.winner, GAS.winTimeout, waiting);
    }

    if (spec.end === "ELIMINATED") {
        const eliminableAt =
            deadlineOf(responder.clock) + allowanceAt(waiting.clock, block);
        const tx = sendTx(
            ctx,
            eliminableAt + between(ctx, 0, 3),
            accounts.keeper,
            tournament.address,
            encodeFunctionData({
                abi: iTournamentAbi,
                functionName: "eliminateMatchByTimeout",
                args: [matchId(record)],
            }),
        );
        return deleteMatch(tx, "TIMEOUT", "NONE", GAS.eliminateTimeout);
    }

    const isLeaf = spec.end === "STEP" || spec.end === "LEAF_TIMEOUT";
    if (isLeaf !== (tournament.level === MAX_LEVEL - 1n)) {
        throw new Error(
            `${ctx.name}: ${spec.end} at level ${tournament.level}`,
        );
    }
    block += delay(responderSide);
    const divergencePosition = position + (leaf & 1n);
    const agreeState = hashOf(idHash, "agree");
    const sealTx = sendAs(
        ctx,
        block,
        responder,
        encodeFunctionData({
            abi: iTournamentAbi,
            functionName: isLeaf
                ? "sealLeafMatch"
                : "sealInnerMatchAndCreateInnerTournament",
            args: [
                matchId(record),
                hashOf(idHash, "leftLeaf"),
                hashOf(idHash, "rightLeaf"),
                agreeState,
                [hashOf(idHash, "agreeProof")],
            ],
        }),
    );
    respond(responder.clock, block, ctx.name);
    if (isLeaf) {
        startClock(one.clock, block);
        startClock(two.clock, block);
    }
    record.seal = {
        log: emit(ctx, sealTx),
        leaf: isLeaf,
        divergencePosition,
        agreeState,
        finalStateOne: one.finalStateHash,
        finalStateTwo: two.finalStateHash,
        eliminableAt:
            block +
            max(allowanceAt(one.clock, block), allowanceAt(two.clock, block)),
    };

    if (spec.end === "STEP") {
        refundTo(sealTx, GAS.sealLeaf, responder);
        const winner = sides[spec.winner];
        const at = block + between(ctx, 2, 5);
        const tx = sendAs(
            ctx,
            at,
            winner,
            encodeFunctionData({
                abi: iTournamentAbi,
                functionName: "winLeafMatch",
                args: [
                    matchId(record),
                    ...winner.children,
                    `0x${Array.from({ length: 8 }, (_, i) => hashOf(idHash, "proof", i).slice(2)).join("")}`,
                ],
            }),
        );
        pauseCharged(winner.clock, at, 0n);
        return deleteMatch(tx, "STEP", spec.winner, GAS.winLeaf, winner);
    }

    if (spec.end === "LEAF_TIMEOUT") {
        refundTo(sealTx, GAS.sealLeaf, responder);
        const winner = sides[spec.winner];
        const loser = sides[other(spec.winner)];
        const loserDeadline = deadlineOf(loser.clock);
        if (deadlineOf(winner.clock) <= loserDeadline) {
            throw new Error(
                `${ctx.name}: ${spec.winner} does not outlast the leaf race`,
            );
        }
        const at = loserDeadline + between(ctx, 1, 3);
        const tx = sendAs(
            ctx,
            at,
            winner,
            encodeFunctionData({
                abi: iTournamentAbi,
                functionName: "winMatchByTimeout",
                args: [matchId(record), ...winner.children],
            }),
        );
        pauseCharged(winner.clock, at, 0n);
        return deleteMatch(tx, "TIMEOUT", spec.winner, GAS.winTimeout, winner);
    }

    const envelope = max(
        allowanceAt(one.clock, block),
        allowanceAt(two.clock, block),
    );
    const child = runTournament(ctx, spec.inner, {
        level: Number(tournament.level) + 1,
        epochIndex: tournament.epochIndex,
        address: addressOf(ctx.name, "tournament", ctx.tournaments.length),
        allowance: envelope,
        baseCycle: tournament.baseCycle + (divergencePosition << log2step),
        initialHash: agreeState,
        parent: { address: tournament.address, matchIdHash: idHash },
        created: emit(ctx, sealTx),
        divergenceCycle,
        claimant: (claim) => {
            const side = claim.side ?? "ONE";
            return {
                account: sides[side].submitter,
                honest: sides[side].honest,
                side,
                relayed: claim.relayed ?? sides[side].relayed,
                rejectsRefunds:
                    claim.rejectsRefunds ?? sides[side].rejectsRefunds,
            };
        },
    });
    refundTo(sealTx, GAS.sealInner, responder);

    if (child.winner && (spec.inner.recovered ?? true)) {
        recoverBond(
            ctx,
            child,
            child.winner,
            child.finishedAt + between(ctx, 2, 6),
        );
    }

    if (child.winner && !spec.unused) {
        const side = child.winner.side ?? "ONE";
        const winner = sides[side];
        const at = child.finishedAt + between(ctx, 1, 4);
        child.consumedAt = at;
        const tx = sendAs(
            ctx,
            at,
            winner,
            encodeFunctionData({
                abi: iTournamentAbi,
                functionName: "winInnerTournament",
                args: [child.address, ...winner.children],
            }),
        );
        winner.clock.push({
            block: at,
            running: false,
            allowance:
                allowanceAt(child.winner.clock, child.finishedAt) -
                (at - child.finishedAt),
        });
        return {
            ...deleteMatch(tx, "CHILD_TOURNAMENT", side, GAS.winInner, winner),
            child,
        };
    }

    const eliminableAt = child.winner ? child.expiresAt : child.finishedAt + 1n;
    const tx = sendTx(
        ctx,
        eliminableAt + between(ctx, 0, 3),
        accounts.keeper,
        tournament.address,
        encodeFunctionData({
            abi: iTournamentAbi,
            functionName: "eliminateInnerTournament",
            args: [child.address],
        }),
    );
    return {
        ...deleteMatch(tx, "CHILD_TOURNAMENT", "NONE", GAS.eliminateInner),
        child,
    };
};

const runTournament = (
    ctx: Context,
    spec: TournamentSpec,
    setup: TournamentSetup,
): TournamentRecord => {
    const level = LEVELS[setup.level];
    const createdAt = setup.created.tx.block;
    const tournament: TournamentRecord = {
        address: setup.address,
        epochIndex: setup.epochIndex,
        level: BigInt(setup.level),
        log2step: level.log2step,
        height: level.height,
        allowance: setup.allowance,
        bondValue: level.bondValue,
        baseCycle: setup.baseCycle,
        initialHash: setup.initialHash,
        parent: setup.parent,
        created: setup.created,
        closesAt: createdAt + setup.allowance,
        finishedAt: createdAt + setup.allowance,
        winner: null,
        expiresAt: 0n,
        consumedAt: null,
        commitments: [],
        matches: [],
        bondEvents: [],
    };
    ctx.tournaments.push(tournament);

    type Event = { block: bigint; seq: number; run: () => void };
    const queue: Event[] = [];
    let seq = 0;
    const schedule = (block: bigint, run: () => void) =>
        queue.push({ block, seq: seq++, run });

    let dangling = null as CommitmentRecord | null;
    let matchIndex = 0;

    const pair = (commitment: CommitmentRecord, tx: TxRecord) => {
        if (!dangling) {
            dangling = commitment;
            return;
        }
        const matchSpec = spec.matches[matchIndex++];
        if (!matchSpec) {
            throw new Error(
                `${ctx.name}: no spec for match ${matchIndex} of ${tournament.address}`,
            );
        }
        const match = runMatch(
            ctx,
            tournament,
            dangling,
            commitment,
            emit(ctx, tx),
            matchSpec,
            setup.divergenceCycle,
        );
        dangling = null;
        tournament.matches.push(match);
        schedule(match.end.log.tx.block, () => {
            if (match.end.winner === "NONE") return;
            pair(
                match.end.winner === "ONE" ? match.one : match.two,
                match.end.log.tx,
            );
        });
    };

    spec.claims.forEach((claim, index) => {
        const block = createdAt + BigInt(claim.joinAt ?? 3 + index * 2);
        if (block >= tournament.closesAt) {
            throw new Error(`${ctx.name}: join after the tournament closes`);
        }
        schedule(block, () => {
            const claimant = setup.claimant(claim);
            const { commitment, children } = commitmentOf(
                tournament.address,
                claimant.honest ? "honest" : index,
            );
            const finalStateHash = !claimant.honest
                ? hashOf(tournament.address, "final", index)
                : setup.level === 0
                  ? machineAfter(ctx.name, setup.epochIndex)
                  : hashOf(ctx.name, setup.epochIndex, "final", setup.level);
            const sender = claimant.relayed
                ? addressOf(claimant.account, "wallet")
                : tournament.address;
            const tx = sendTx(
                ctx,
                block,
                claimant.account,
                sender,
                claimant.relayed
                    ? `0x6a761202${hashOf(commitment, "relay").slice(2)}`
                    : encodeFunctionData({
                          abi: iTournamentAbi,
                          functionName: "joinTournament",
                          args: [
                              finalStateHash,
                              [hashOf(commitment, "proof")],
                              ...children,
                          ],
                      }),
                tournament.bondValue,
            );
            const record: CommitmentRecord = {
                tournament: tournament.address,
                commitment,
                children,
                finalStateHash,
                submitter: claimant.account,
                sender,
                rejectsRefunds: claimant.rejectsRefunds,
                honest: claimant.honest,
                side: claimant.side,
                joined: emit(ctx, tx),
                relayed: claimant.relayed,
                clock: [
                    {
                        block,
                        running: false,
                        allowance: setup.allowance - (block - createdAt),
                    },
                ],
                clearedAt: null,
            };
            tournament.commitments.push(record);
            pair(record, tx);
        });
    });

    while (queue.length > 0) {
        queue.sort((a, b) =>
            a.block !== b.block ? Number(a.block - b.block) : a.seq - b.seq,
        );
        queue.shift()?.run();
    }

    if (matchIndex !== spec.matches.length) {
        throw new Error(
            `${ctx.name}: ${spec.matches.length - matchIndex} match specs left unused`,
        );
    }

    tournament.winner = dangling;
    tournament.finishedAt = tournament.matches.reduce(
        (last, match) =>
            match.end.log.tx.block > last ? match.end.log.tx.block : last,
        tournament.closesAt,
    );
    const { winner } = tournament;
    if (setup.level > 0 && winner) {
        tournament.expiresAt =
            tournament.finishedAt +
            allowanceAt(winner.clock, tournament.finishedAt);
    }
    return tournament;
};

const rootClaimant = (claim: ClaimSpec): Claimant => ({
    account: claim.account ?? accounts.node,
    honest: claim.honest ?? false,
    side: null,
    relayed: claim.relayed ?? false,
    rejectsRefunds: claim.rejectsRefunds ?? false,
});

/**
 * Generate the chain history of a PRT application. Dave seals the empty
 * epoch 0 when the application is deployed, and the node wins it
 * uncontested. Inputs sent meanwhile form epoch 1, whose root tournament
 * plays out as specified. Every accepted result seals the next epoch and
 * opens its root tournament. Blocks are absolute, counted from the anchor.
 */
export const buildPrtTimeline = (
    spec: PrtScenarioSpec,
    anchor: bigint,
): PrtTimeline => {
    const ctx: Context = {
        ...createChain(spec.name),
        tournaments: [],
        inputs: Math.max(spec.inputs, 1),
    };
    const consensus = addressOf(spec.name, "consensus");
    const epochs: PrtEpochRecord[] = [];
    let applicationStatus: ApplicationStatusRecord | null = null;

    const openEpoch = (
        index: bigint,
        sealTx: TxRecord,
        inputs: [bigint, bigint],
        rootSpec: TournamentSpec,
    ): PrtEpochRecord => {
        const sealed = emit(ctx, sealTx);
        const root = runTournament(ctx, rootSpec, {
            level: 0,
            epochIndex: index,
            address: addressOf(spec.name, "tournament", ctx.tournaments.length),
            allowance: MAX_ALLOWANCE,
            baseCycle: 0n,
            initialHash: machineAfter(spec.name, index > 0n ? index - 1n : 0n),
            parent: null,
            created: sealed,
            divergenceCycle: null,
            claimant: rootClaimant,
        });
        const epoch: PrtEpochRecord = {
            index,
            sealed,
            inputs,
            root,
            nodeClaim:
                root.commitments.find(
                    (commitment) =>
                        commitment.honest &&
                        commitment.submitter === accounts.node,
                ) ?? null,
            staged: null,
            accepted: null,
        };
        epochs.push(epoch);
        return epoch;
    };

    const settle = (epoch: PrtEpochRecord, recovered: boolean) => {
        const { root } = epoch;
        if (!root.winner) return null;
        if (recovered) {
            recoverBond(
                ctx,
                root,
                root.winner,
                root.finishedAt + between(ctx, 4, 10),
            );
        }
        const stagedAt = root.finishedAt + 2n;
        epoch.staged = emit(
            ctx,
            sendTx(
                ctx,
                stagedAt,
                root.winner.submitter,
                consensus,
                toFunctionSelector(
                    getAbiItem({
                        abi: iDaveConsensusAbi,
                        name: "stageTournamentResult",
                    }),
                ),
            ),
        );
        const acceptTx = sendTx(
            ctx,
            stagedAt + CLAIM_STAGING_PERIOD + 1n,
            root.winner.submitter,
            consensus,
            encodeFunctionData({
                abi: iDaveConsensusAbi,
                functionName: "acceptStagedTournamentResult",
                args: [epoch.index],
            }),
        );
        epoch.accepted = emit(ctx, acceptTx);
        return acceptTx;
    };

    const deployTx = sendTx(ctx, anchor, accounts.node, consensus, "0x");
    const genesis = openEpoch(0n, deployTx, [0n, 0n], {
        claims: [{ account: accounts.node, honest: true }],
        matches: [],
    });

    const inputs = Array.from({ length: spec.inputs }, (_, i): InputRecord => {
        const block = anchor + 20n + BigInt(i) * 3n;
        const sender = accounts.users[i % accounts.users.length];
        const payload = stringToHex(`Hello from Dave! #${i}`);
        const tx = sendTx(
            ctx,
            block,
            sender,
            inputBoxAddress,
            encodeFunctionData({
                abi: iInputBoxAbi,
                functionName: "addInput",
                args: [spec.address, payload],
            }),
        );
        return {
            index: BigInt(i),
            epochIndex: 1n,
            log: emit(ctx, tx),
            sender,
            payload,
            processedAt: block + 1n,
        };
    });

    const sealDispute = settle(genesis, true);
    if (!sealDispute) throw new Error(`${spec.name}: epoch 0 has no winner`);
    const dispute = openEpoch(
        1n,
        sealDispute,
        [0n, BigInt(spec.inputs)],
        spec.root,
    );
    const { root, nodeClaim } = dispute;
    if (!nodeClaim) {
        applicationStatus = {
            status: "FAILED",
            block: root.closesAt,
            reason: "The tournament closed before the node joined epoch 1",
        };
    } else if (root.winner && root.winner !== nodeClaim) {
        applicationStatus = {
            status: "DIVERGED",
            block: root.finishedAt,
            reason: `Epoch 1 has inconsistent commitment between off-chain (${nodeClaim.commitment}) and on-chain (${root.winner.commitment})`,
        };
    }

    const sealNext = settle(dispute, spec.root.recovered ?? false);
    if (sealNext) {
        openEpoch(2n, sealNext, [BigInt(spec.inputs), BigInt(spec.inputs)], {
            claims:
                applicationStatus === null
                    ? [{ account: accounts.node, honest: true }]
                    : [],
            matches: [],
        });
    }

    assignLogIndexes(ctx.logs);
    return {
        name: spec.name,
        address: spec.address,
        consensus,
        anchor,
        inputs,
        epochs,
        root,
        nodeClaim,
        tournaments: ctx.tournaments,
        applicationStatus,
        txs: ctx.txs,
        endsAt: ctx.txs.reduce(
            (last, tx) => (tx.block > last ? tx.block : last),
            root.finishedAt,
        ),
    };
};
