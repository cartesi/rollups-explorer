import type {
    Application,
    BondEvent,
    Commitment,
    Epoch,
    EpochStatus,
    Input,
    Match,
    MatchAdvanced,
    MatchSnapshot,
    MatchTimeoutOutcome,
    Tournament,
    TournamentSnapshot,
    TournamentStandingState,
} from "@cartesi/client";
import { zeroAddress, zeroHash, type Hash } from "viem";
import {
    createBondEvent,
    createCommitment,
    createMatch,
    createMatchAdvanced,
    createMatchSnapshot,
    createMatchState,
    createTournament,
} from "../../../stories/prt";
import {
    createApplication,
    createEpoch,
    createInput,
    createOutput,
    createReport,
    createWithdrawal,
    encodeAccount,
    encodeWithdrawalOutput,
} from "../../../stories/rollups";
import type { ApplicationData } from "../rpc";
import { hashOf, type LogRecord } from "./chain";
import type {
    EpochRecord,
    RollupsInputRecord,
    RollupsTimeline,
} from "./rollups";
import {
    CLAIM_STAGING_PERIOD,
    MAX_LEVEL,
    allowanceAt,
    commitmentOf,
    getBondBalance,
    getRecoveryPayment,
    machineAfter,
    type ClockChange,
    type CommitmentRecord,
    type MatchRecord,
    type PrtEpochRecord,
    type PrtTimeline,
    type TournamentRecord,
} from "./timeline";

export const CHAIN_ID = 13370;

export type BlockTime = (block: bigint) => Date;

type View = { head: bigint; time: BlockTime };

const reached = (log: LogRecord | null | undefined, head: bigint) =>
    log !== null && log !== undefined && log.tx.block <= head;

const byLog =
    <T>(logOf: (item: T) => LogRecord) =>
    (a: T, b: T) => {
        const left = logOf(a);
        const right = logOf(b);
        return left.tx.block !== right.tx.block
            ? Number(left.tx.block - right.tx.block)
            : Number(left.index - right.index);
    };

const clockAt = (clock: ClockChange[], head: bigint) =>
    [...clock].reverse().find((change) => change.block <= head) ?? clock[0];

const isEnded = (match: MatchRecord, head: bigint) =>
    reached(match.end.log, head);

const tournamentLogs = (tournament: TournamentRecord): LogRecord[] => [
    tournament.created,
    ...tournament.commitments.map((commitment) => commitment.joined),
    ...tournament.matches.flatMap((match) => [
        match.created,
        match.end.log,
        ...match.advances.map((advance) => advance.log),
        ...(match.seal ? [match.seal.log] : []),
    ]),
    ...tournament.bondEvents.map((event) => event.log),
];

const lastUpdate = (logs: LogRecord[], head: bigint) =>
    logs.reduce(
        (last, log) =>
            log.tx.block <= head && log.tx.block > last ? log.tx.block : last,
        logs[0].tx.block,
    );

const parentMatchOf = (timeline: PrtTimeline, tournament: TournamentRecord) =>
    timeline.tournaments
        .flatMap((parent) => parent.matches)
        .find((match) => match.child === tournament);

const toParentCommitment = (
    timeline: PrtTimeline,
    tournament: TournamentRecord,
    commitment: CommitmentRecord,
): Hash | null => {
    const match = parentMatchOf(timeline, tournament);
    if (!match) return null;
    return commitment.side === "TWO"
        ? match.two.commitment
        : match.one.commitment;
};

const recoveryOf = (tournament: TournamentRecord) =>
    tournament.bondEvents.find((event) => event.type === "BOND_RECOVERED");

/**
 * The block the node stops reading a tournament: once its standing is
 * terminal and its bond has no winner or was recovered. An inner winner is
 * read until it expires.
 */
const retiredAt = (tournament: TournamentRecord) => {
    if (!tournament.winner) return tournament.finishedAt;
    const recovery = recoveryOf(tournament);
    if (!recovery) return null;
    const settled =
        tournament.level === 0n ? tournament.finishedAt : tournament.expiresAt;
    return recovery.log.tx.block > settled ? recovery.log.tx.block : settled;
};

const observedAt = (tournament: TournamentRecord, head: bigint) => {
    const retired = retiredAt(tournament);
    return retired !== null && head >= retired ? retired : head;
};

/**
 * The claim waiting to be paired: joined, not eliminated and not in an
 * ongoing match.
 */
const waitingClaim = (tournament: TournamentRecord, head: bigint) => {
    const busy = new Set(
        tournament.matches
            .filter(
                (match) =>
                    reached(match.created, head) && !isEnded(match, head),
            )
            .flatMap((match) => [match.one, match.two]),
    );
    return (
        tournament.commitments.find(
            (commitment) =>
                reached(commitment.joined, head) &&
                !busy.has(commitment) &&
                (commitment.clearedAt === null || commitment.clearedAt > head),
        ) ?? null
    );
};

const getStanding = (
    tournament: TournamentRecord,
    head: bigint,
): TournamentStandingState => {
    if (
        tournament.matches.some(
            (match) => reached(match.created, head) && !isEnded(match, head),
        )
    ) {
        return "MATCHES_ACTIVE";
    }
    if (head < tournament.finishedAt) return "AWAITING_CLOSURE";
    if (tournament.level === 0n) {
        return tournament.winner ? "ROOT_WINNER" : "ROOT_FAILED";
    }
    if (!tournament.winner) return "INNER_ELIMINABLE_NO_WINNER";
    return head < tournament.expiresAt
        ? "INNER_WINNER"
        : "INNER_ELIMINABLE_WINNER_EXPIRED";
};

const getBondRecovery = (
    tournament: TournamentRecord,
    head: bigint,
): TournamentSnapshot["bondRecovery"] => {
    const { winner } = tournament;
    if (head < tournament.finishedAt) {
        return {
            disposition: "TOURNAMENT_RUNNING",
            claimer: null,
            payment: null,
        };
    }
    if (!winner) {
        return { disposition: "NO_WINNER", claimer: null, payment: null };
    }
    if (reached(recoveryOf(tournament)?.log, head)) {
        return { disposition: "RECOVERED", claimer: null, payment: null };
    }
    return {
        disposition: "RECOVERABLE",
        claimer: winner.submitter,
        payment: getRecoveryPayment(
            getBondBalance(tournament, head),
            tournament.bondValue,
        ),
    };
};

const viewTournament = (
    timeline: PrtTimeline,
    tournament: TournamentRecord,
    { head: latest, time }: View,
): Tournament => {
    const head = observedAt(tournament, latest);
    const finished = head >= tournament.finishedAt;
    const inner = tournament.level > 0n;
    const { winner, created } = tournament;
    const current =
        finished && winner && (!inner || head < tournament.expiresAt)
            ? winner
            : null;
    const candidate = finished ? winner : waitingClaim(tournament, head);
    const innerWinner = inner ? current : null;
    const parentCommitment = innerWinner
        ? toParentCommitment(timeline, tournament, innerWinner)
        : null;

    return createTournament({
        epochIndex: tournament.epochIndex,
        address: tournament.address,
        parentTournamentAddress: tournament.parent?.address ?? null,
        parentMatchIdHash: tournament.parent?.matchIdHash ?? null,
        maxLevel: MAX_LEVEL,
        level: tournament.level,
        log2step: tournament.log2step,
        height: tournament.height,
        createdAt: time(created.tx.block),
        updatedAt: time(lastUpdate(tournamentLogs(tournament), head)),
        initialHash: tournament.initialHash,
        baseCycle: tournament.baseCycle,
        kind: tournament.level === MAX_LEVEL - 1n ? "LEAF" : "NON_LEAF",
        startInstant: created.tx.block,
        allowance: tournament.allowance,
        creationEvent: inner
            ? {
                  blockNumber: created.tx.block,
                  txHash: created.tx.hash,
                  logIndex: created.index,
              }
            : null,
        snapshot: {
            asOfBlock: head,
            standing: getStanding(tournament, head),
            acceptsJoins: head < tournament.closesAt,
            candidate: candidate?.commitment ?? null,
            winnerCommitment: current?.commitment ?? null,
            finalStateHash: current?.finalStateHash ?? null,
            parentCommitment,
            finishedAtBlock: finished ? tournament.finishedAt : 0n,
            winnerExpiresAt: innerWinner ? tournament.expiresAt : 0n,
            innerResult: inner
                ? {
                      disposition: !finished
                          ? "UNSETTLED"
                          : innerWinner
                            ? "WINNER"
                            : "ELIMINABLE",
                      parentCommitment,
                      pausedAllowance: innerWinner
                          ? allowanceAt(
                                innerWinner.clock,
                                tournament.finishedAt,
                            ) -
                            (head - tournament.finishedAt)
                          : 0n,
                  }
                : null,
            bondRecovery: getBondRecovery(tournament, head),
        },
    });
};

const viewCommitment = (
    commitment: CommitmentRecord,
    epochIndex: bigint,
    head: bigint,
    time: BlockTime,
): Commitment => {
    const cleared =
        commitment.clearedAt !== null && commitment.clearedAt <= head;
    const clock = clockAt(commitment.clock, head);
    const { joined } = commitment;
    return createCommitment({
        epochIndex,
        tournamentAddress: commitment.tournament,
        commitment: commitment.commitment,
        finalStateHash: commitment.finalStateHash,
        submitterAddress: commitment.submitter,
        blockNumber: joined.tx.block,
        txHash: joined.tx.hash,
        logIndex: joined.index,
        createdAt: time(joined.tx.block),
        updatedAt: time(
            cleared && commitment.clearedAt !== null
                ? commitment.clearedAt
                : clock.block,
        ),
        snapshot: {
            asOfBlock: head,
            claimer: cleared ? zeroAddress : commitment.submitter,
            clockRunning: clock.running,
            clockDeadline: clock.running ? clock.block + clock.allowance : 0n,
            clockAllowance: clock.allowance,
        },
    });
};

/**
 * Dave's `classifyTimeoutAt`: a clock expires at its deadline. A paused
 * survivor is charged the expired side's overdue blocks and wins only while
 * it keeps time left; a running survivor in a leaf race has already paid.
 */
const getTimeout = (
    match: MatchRecord,
    head: bigint,
): { timeoutOutcome: MatchTimeoutOutcome; deferredCharge: bigint } => {
    const left = {
        ONE: allowanceAt(match.one.clock, head),
        TWO: allowanceAt(match.two.clock, head),
    };
    if (left.ONE > 0n && left.TWO > 0n) {
        return { timeoutOutcome: "NONE", deferredCharge: 0n };
    }
    if (left.ONE === 0n && left.TWO === 0n) {
        return { timeoutOutcome: "ELIMINATE_BOTH", deferredCharge: 0n };
    }
    const survivor = left.ONE > 0n ? "ONE" : "TWO";
    const [kept, expired] =
        survivor === "ONE" ? [match.one, match.two] : [match.two, match.one];
    const expiredClock = clockAt(expired.clock, head);
    const deferredCharge = clockAt(kept.clock, head).running
        ? 0n
        : head - (expiredClock.block + expiredClock.allowance);
    return left[survivor] > deferredCharge
        ? {
              timeoutOutcome: survivor === "ONE" ? "ONE_WINS" : "TWO_WINS",
              deferredCharge,
          }
        : { timeoutOutcome: "ELIMINATE_BOTH", deferredCharge: 0n };
};

const viewMatchSnapshot = (
    match: MatchRecord,
    tournament: Tournament,
    advances: MatchAdvanced[],
    head: bigint,
): MatchSnapshot => {
    if (isEnded(match, head)) {
        return createMatchSnapshot({ asOfBlock: match.end.log.tx.block });
    }
    const { seal } = match;
    const timeout = getTimeout(match, head);
    if (seal && reached(seal.log, head)) {
        const position =
            advances[advances.length - 1]?.segmentStartPosition ?? 0n;
        return createMatchState({
            tournament,
            advances,
            asOfBlock: head,
            ...timeout,
            sealed: {
                right: seal.divergencePosition !== position,
                agreeState: seal.agreeState,
                finalStateOne: seal.finalStateOne,
                finalStateTwo: seal.finalStateTwo,
            },
        });
    }
    return createMatchState({
        tournament,
        advances,
        asOfBlock: head,
        ...timeout,
    });
};

const viewMatch = (
    match: MatchRecord,
    tournament: Tournament,
    advances: MatchAdvanced[],
    head: bigint,
    time: BlockTime,
): Match => {
    const ended = isEnded(match, head);
    const { created, end, seal } = match;
    const leafSeal = seal?.leaf && reached(seal.log, head) ? seal : null;
    const updated = [
        created,
        ...match.advances.map((advance) => advance.log),
        ...(seal ? [seal.log] : []),
        end.log,
    ];
    return createMatch({
        epochIndex: tournament.epochIndex,
        tournamentAddress: tournament.address,
        idHash: match.idHash,
        commitmentOne: match.one.commitment,
        commitmentTwo: match.two.commitment,
        leftOfTwo: match.leftOfTwo,
        blockNumber: created.tx.block,
        txHash: created.tx.hash,
        logIndex: created.index,
        winnerCommitment: ended ? end.winner : "NONE",
        deletionReason: ended ? end.reason : "NOT_DELETED",
        deletionBlockNumber: ended ? end.log.tx.block : null,
        deletionTxHash: ended ? end.log.tx.hash : null,
        deletionLogIndex: ended ? end.log.index : null,
        createdAt: time(created.tx.block),
        updatedAt: time(lastUpdate(updated, head)),
        eliminableAt: match.eliminableAt,
        leafSeal: leafSeal && {
            eliminableAt: leafSeal.eliminableAt,
            blockNumber: leafSeal.log.tx.block,
            txHash: leafSeal.log.tx.hash,
            logIndex: leafSeal.log.index,
        },
        snapshot: viewMatchSnapshot(match, tournament, advances, head),
    });
};

/**
 * Tournaments, commitments, matches, advances and bond events of a PRT
 * scenario as the node reports them at the head block.
 */
export const viewDispute = (timeline: PrtTimeline, view: View) => {
    const { head, time } = view;
    const records = timeline.tournaments
        .filter((tournament) => reached(tournament.created, head))
        .sort(byLog((tournament) => tournament.created));
    const tournaments = records.map((record) =>
        viewTournament(timeline, record, view),
    );
    const epochOf = new Map(
        records.map((record) => [record.address, record.epochIndex]),
    );

    const commitments = records.flatMap((record) =>
        record.commitments
            .filter((commitment) => reached(commitment.joined, head))
            .sort(byLog((commitment) => commitment.joined))
            .map((commitment) =>
                viewCommitment(
                    commitment,
                    record.epochIndex,
                    observedAt(record, head),
                    time,
                ),
            ),
    );

    const matchAdvances: MatchAdvanced[] = [];
    const matches = records.flatMap((record, index) =>
        record.matches
            .filter((match) => reached(match.created, head))
            .sort(byLog((match) => match.created))
            .map((match) => {
                const advances = match.advances
                    .filter((advance) => reached(advance.log, head))
                    .map((advance) =>
                        createMatchAdvanced({
                            epochIndex: record.epochIndex,
                            tournamentAddress: record.address,
                            idHash: match.idHash,
                            otherParent: advance.otherParent,
                            leftNode: advance.leftNode,
                            blockNumber: advance.log.tx.block,
                            txHash: advance.log.tx.hash,
                            logIndex: advance.log.index,
                            createdAt: time(advance.log.tx.block),
                            updatedAt: time(advance.log.tx.block),
                            segmentStartPosition: advance.segmentStartPosition,
                            eliminableAt: advance.eliminableAt,
                        }),
                    );
                matchAdvances.push(...advances);
                return viewMatch(
                    match,
                    tournaments[index],
                    advances,
                    observedAt(record, head),
                    time,
                );
            }),
    );

    const bondEvents = records
        .flatMap((record) =>
            record.bondEvents.filter((event) => reached(event.log, head)),
        )
        .sort(byLog((event) => event.log))
        .map(
            (event): BondEvent =>
                createBondEvent({
                    epochIndex: epochOf.get(event.tournament) ?? 0n,
                    tournamentAddress: event.tournament,
                    blockNumber: event.log.tx.block,
                    txHash: event.log.tx.hash,
                    logIndex: event.log.index,
                    createdAt: time(event.log.tx.block),
                    updatedAt: time(event.log.tx.block),
                    ...(event.type === "PARTIAL_BOND_REFUND"
                        ? {
                              type: event.type,
                              refund: {
                                  recipient: event.recipient,
                                  value: event.value,
                                  success: event.success,
                              },
                              recovery: null,
                          }
                        : {
                              type: event.type,
                              refund: null,
                              recovery: {
                                  commitment: event.commitment,
                                  claimer: event.claimer,
                                  payment: event.payment,
                                  burned: event.burned,
                              },
                          }),
                }),
        );

    return { tournaments, commitments, matches, matchAdvances, bondEvents };
};

const isOwnResult = (epoch: PrtEpochRecord) =>
    epoch.nodeClaim !== null && epoch.root.winner === epoch.nodeClaim;

/**
 * Status of a sealed PRT epoch: the node computes its claim, then follows the
 * contract's staging and acceptance of its own result. Joining the tournament
 * does not change the epoch, and a diverged node stops processing.
 */
const getPrtEpochStatus = (
    timeline: PrtTimeline,
    epoch: PrtEpochRecord,
    head: bigint,
): EpochStatus => {
    const sealedAt = epoch.sealed.tx.block;
    const status = timeline.applicationStatus;
    const stopped =
        status?.status === "DIVERGED" &&
        epoch.index > 1n &&
        status.block <= sealedAt;
    if (stopped) return "CLOSED";
    if (isOwnResult(epoch)) {
        if (reached(epoch.accepted, head)) return "CLAIM_ACCEPTED";
        if (reached(epoch.staged, head)) return "CLAIM_STAGED";
    }
    if (head >= sealedAt + 2n) return "CLAIM_COMPUTED";
    if (head >= sealedAt + 1n) return "INPUTS_PROCESSED";
    return "CLOSED";
};

const viewEpochs = (timeline: PrtTimeline, { head, time }: View): Epoch[] => {
    const sealed = timeline.epochs.filter((epoch) =>
        reached(epoch.sealed, head),
    );
    const rows = sealed.map((epoch, position): Epoch => {
        const sealedAt = epoch.sealed.tx.block;
        const previous = sealed[position - 1];
        const status = getPrtEpochStatus(timeline, epoch, head);
        const computed = status !== "CLOSED" && status !== "INPUTS_PROCESSED";
        const { commitment } = commitmentOf(epoch.root.address, "honest");
        const own = isOwnResult(epoch);
        const changes = [
            sealedAt,
            sealedAt + 1n,
            sealedAt + 2n,
            own ? epoch.staged?.tx.block : undefined,
            epoch.accepted?.tx.block,
        ].filter(
            (block): block is bigint => block !== undefined && block <= head,
        );
        return createEpoch({
            index: epoch.index,
            firstBlock: previous ? previous.sealed.tx.block : timeline.anchor,
            lastBlock: sealedAt,
            inputIndexLowerBound: epoch.inputs[0],
            inputIndexUpperBound: epoch.inputs[1],
            machineHash: computed
                ? machineAfter(timeline.name, epoch.index)
                : null,
            txBufferDataBlock: computed
                ? hashOf(timeline.name, epoch.index, "outputs root")
                : null,
            commitment: computed ? commitment : null,
            commitmentProof: computed ? [hashOf(commitment, "proof")] : null,
            claimTransactionHash: reached(epoch.accepted, head)
                ? (epoch.accepted?.tx.hash ?? null)
                : null,
            tournamentAddress: epoch.root.address,
            status,
            stagedAtBlock:
                own && reached(epoch.staged, head)
                    ? (epoch.staged?.tx.block ?? null)
                    : null,
            virtualIndex: epoch.index,
            createdAt: time(
                previous ? previous.sealed.tx.block : timeline.anchor,
            ),
            updatedAt: time(changes.reduce((a, b) => (b > a ? b : a))),
        });
    });
    const last = sealed[sealed.length - 1];
    const index = last.index + 1n;
    const lower = last.inputs[1];
    const received = timeline.inputs.filter(
        (input) => input.epochIndex === index && reached(input.log, head),
    ).length;
    rows.push(
        createEpoch({
            index,
            firstBlock: last.sealed.tx.block,
            lastBlock: head,
            inputIndexLowerBound: lower,
            inputIndexUpperBound: lower + BigInt(received),
            status: "OPEN",
            virtualIndex: index,
            createdAt: time(last.sealed.tx.block),
            updatedAt: time(head),
        }),
    );
    return rows;
};

const viewInputs = (timeline: PrtTimeline, { head, time }: View): Input[] =>
    timeline.inputs
        .filter((input) => reached(input.log, head))
        .map((input) => {
            const block = input.log.tx.block;
            const processed = input.processedAt <= head;
            return createInput({
                epochIndex: input.epochIndex,
                index: input.index,
                blockNumber: block,
                decodedData: {
                    chainId: BigInt(CHAIN_ID),
                    applicationContract: timeline.address,
                    sender: input.sender,
                    blockNumber: block,
                    blockTimestamp: BigInt(
                        Math.floor(time(block).getTime() / 1000),
                    ),
                    prevRandao: BigInt(hashOf(timeline.name, "randao", block)),
                    index: input.index,
                    payload: input.payload,
                },
                status: processed ? "ACCEPTED" : "NONE",
                machineHash: processed
                    ? hashOf(timeline.name, "machine", input.index)
                    : null,
                transactionHash: input.log.tx.hash,
                logIndex: input.log.index,
                createdAt: time(block),
                updatedAt: time(processed ? input.processedAt : block),
            });
        });

export const viewPrtApplication = (
    timeline: PrtTimeline,
    view: View,
): ApplicationData => {
    const { head, time } = view;
    const inputs = viewInputs(timeline, view);
    const status =
        timeline.applicationStatus && head >= timeline.applicationStatus.block
            ? timeline.applicationStatus
            : null;
    const application: Application = createApplication({
        name: timeline.name,
        applicationAddress: timeline.address,
        consensusAddress: timeline.consensus,
        templateHash: hashOf(timeline.name, "template"),
        consensusType: "PRT",
        claimStagingPeriod: CLAIM_STAGING_PERIOD,
        status: status?.status ?? "OK",
        reason: status?.reason ?? null,
        inputBoxBlock: timeline.anchor,
        lastEpochCheckBlock: head,
        lastInputCheckBlock: head,
        lastOutputCheckBlock: head,
        lastTournamentCheckBlock: head,
        lastForecloseCheckBlock: head,
        lastAccountsDriveProvedCheckBlock: head,
        lastWithdrawalCheckBlock: head,
        processedInputs: BigInt(
            inputs.filter((input) => input.status !== "NONE").length,
        ),
        createdAt: time(timeline.anchor),
        updatedAt: time(status?.block ?? head),
    });
    return {
        application,
        epochs: viewEpochs(timeline, view),
        inputs,
        outputs: [],
        reports: [],
        withdrawals: [],
        ...viewDispute(timeline, view),
    };
};

const getRollupsEpochStatus = (
    epoch: EpochRecord,
    head: bigint,
): EpochStatus => {
    if (head >= epoch.settledAt) return epoch.settlement;
    if (epoch.stagedAt !== null && head >= epoch.stagedAt) {
        return "CLAIM_STAGED";
    }
    if (epoch.submitted && head >= epoch.submitted.block) {
        return "CLAIM_SUBMITTED";
    }
    if (head >= epoch.computedAt) return "CLAIM_COMPUTED";
    if (head >= epoch.processedAt) return "INPUTS_PROCESSED";
    if (head > epoch.lastBlock) return "CLOSED";
    return "OPEN";
};

const viewRollupsEpoch = (
    timeline: RollupsTimeline,
    epoch: EpochRecord,
    { head, time }: View,
): Epoch => {
    const status = getRollupsEpochStatus(epoch, head);
    const computed = head >= epoch.computedAt && epoch.submitted !== null;
    const claim = hashOf(timeline.name, "claim", epoch.index);
    const proof = (name: string) =>
        computed
            ? Array.from({ length: 3 }, (_, level) =>
                  hashOf(claim, name, level),
              )
            : null;
    const changes = [
        epoch.openedAt,
        epoch.lastBlock + 1n,
        epoch.processedAt,
        epoch.computedAt,
        epoch.submitted?.block ?? epoch.computedAt,
        epoch.stagedAt ?? epoch.computedAt,
        epoch.settledAt,
    ].filter((block) => block <= head);
    const [lower, upper] = epoch.inputs;
    const received = timeline.inputs.filter(
        (input) =>
            input.epochIndex === epoch.index && input.log.tx.block <= head,
    ).length;
    return createEpoch({
        index: epoch.index,
        virtualIndex: epoch.virtualIndex,
        firstBlock: epoch.firstBlock,
        lastBlock: epoch.lastBlock,
        inputIndexLowerBound: lower,
        inputIndexUpperBound:
            status === "OPEN" ? lower + BigInt(received) : upper,
        machineHash: computed ? hashOf(claim, "machine") : null,
        txBufferDataBlock: computed ? hashOf(claim, "tx buffer") : null,
        txBufferProof: proof("tx buffer proof"),
        iflagsYDataBlock: computed ? hashOf(claim, "iflags") : null,
        iflagsYProof: proof("iflags proof"),
        htifTohostDataBlock: computed ? hashOf(claim, "tohost") : null,
        htifTohostProof: proof("tohost proof"),
        commitment: computed ? claim : null,
        commitmentProof: proof("commitment proof"),
        claimTransactionHash:
            epoch.submitted && head >= epoch.submitted.block
                ? epoch.submitted.hash
                : null,
        status,
        stagedAtBlock:
            epoch.stagedAt !== null && head >= epoch.stagedAt
                ? epoch.stagedAt
                : null,
        createdAt: time(epoch.openedAt),
        updatedAt: time(changes.reduce((a, b) => (b > a ? b : a))),
    });
};

export const viewRollupsApplication = (
    timeline: RollupsTimeline,
    view: View,
): ApplicationData => {
    const { head, time } = view;
    const processed = (input: RollupsInputRecord) => input.processedAt <= head;
    const inputRecords = timeline.inputs.filter(
        (input) => input.log.tx.block <= head,
    );
    const processedInputs = new Map(
        inputRecords.filter(processed).map((input) => [input.index, input]),
    );
    const computedAt = new Map(
        timeline.epochs.map((epoch) => [epoch.index, epoch.computedAt]),
    );
    const foreclosure = reached(timeline.foreclosure, head)
        ? timeline.foreclosure
        : null;
    const drive = reached(timeline.accountsDrive?.log, head)
        ? timeline.accountsDrive
        : null;

    const inputs = inputRecords.map((input) => {
        const block = input.log.tx.block;
        const done = processed(input);
        return createInput({
            epochIndex: input.epochIndex,
            index: input.index,
            blockNumber: block,
            decodedData: {
                chainId: BigInt(CHAIN_ID),
                applicationContract: timeline.address,
                sender: input.sender,
                blockNumber: block,
                blockTimestamp: BigInt(
                    Math.floor(time(block).getTime() / 1000),
                ),
                prevRandao: BigInt(hashOf(timeline.name, "randao", block)),
                index: input.index,
                payload: input.payload,
            },
            status: done ? input.status : "NONE",
            exceptionData: done ? input.exceptionData : null,
            machineHash: done
                ? hashOf(timeline.name, "machine", input.index)
                : null,
            txBufferDataBlock: done
                ? hashOf(timeline.name, "tx buffer", input.index)
                : null,
            transactionHash: input.log.tx.hash,
            logIndex: input.log.index,
            createdAt: time(block),
            updatedAt: time(done ? input.processedAt : block),
        });
    });

    const outputs = timeline.outputs
        .filter((output) => processedInputs.has(output.inputIndex))
        .map((output) => {
            const producedAt =
                processedInputs.get(output.inputIndex)?.processedAt ?? head;
            const proved = (computedAt.get(output.epochIndex) ?? head) <= head;
            const executed =
                output.executed && output.executed.block <= head
                    ? output.executed
                    : null;
            return createOutput({
                epochIndex: output.epochIndex,
                inputIndex: output.inputIndex,
                index: output.index,
                decodedData: output.decoded,
                outputHashesSiblings: proved ? output.siblings : null,
                executionTransactionHash: executed?.hash ?? null,
                createdAt: time(producedAt),
                updatedAt: time(executed?.block ?? producedAt),
            });
        });

    const reports = timeline.reports
        .filter((report) => processedInputs.has(report.inputIndex))
        .map((report) => {
            const producedAt =
                processedInputs.get(report.inputIndex)?.processedAt ?? head;
            return createReport({
                epochIndex: report.epochIndex,
                inputIndex: report.inputIndex,
                index: report.index,
                rawData: report.payload,
                createdAt: time(producedAt),
                updatedAt: time(producedAt),
            });
        });

    const withdrawals = timeline.withdrawals
        .filter((withdrawal) => reached(withdrawal.log, head))
        .map((withdrawal) =>
            createWithdrawal({
                accountIndex: withdrawal.accountIndex,
                account: encodeAccount(withdrawal.owner, withdrawal.balance),
                output: encodeWithdrawalOutput(
                    withdrawal.owner,
                    withdrawal.balance,
                ),
                blockNumber: withdrawal.log.tx.block,
                transactionHash: withdrawal.log.tx.hash,
                logIndex: withdrawal.log.index,
                createdAt: time(withdrawal.log.tx.block),
                updatedAt: time(withdrawal.log.tx.block),
            }),
        );

    const application = createApplication({
        name: timeline.name,
        applicationAddress: timeline.address,
        consensusAddress: timeline.consensus,
        templateHash: hashOf(timeline.name, "template"),
        consensusType: timeline.consensusType,
        epochLength: timeline.epochLength,
        claimStagingPeriod: timeline.claimStagingPeriod,
        inputBoxBlock: timeline.anchor,
        lastEpochCheckBlock: head,
        lastInputCheckBlock: head,
        lastOutputCheckBlock: head,
        lastTournamentCheckBlock: head,
        lastForecloseCheckBlock: head,
        lastAccountsDriveProvedCheckBlock: head,
        lastWithdrawalCheckBlock: head,
        processedInputs: BigInt(processedInputs.size),
        forecloseBlock: foreclosure?.tx.block ?? 0n,
        forecloseTransaction: foreclosure?.tx.hash ?? zeroHash,
        accountsDriveProvedBlock: drive?.log.tx.block ?? 0n,
        accountsDriveProvedTransaction: drive?.log.tx.hash ?? zeroHash,
        accountsDriveMerkleRoot: drive?.root ?? zeroHash,
        withdrawalConfig: {
            guardian: timeline.guardian,
            log2LeavesPerAccount: 0n,
            log2MaxNumOfAccounts: 16n,
            accountsDriveStartIndex: 1n << 24n,
            withdrawalOutputBuilder: timeline.withdrawalOutputBuilder,
        },
        createdAt: time(timeline.anchor),
        updatedAt: time(head),
    });

    return {
        application,
        epochs: timeline.epochs
            .filter((epoch) => epoch.openedAt <= head)
            .map((epoch) => viewRollupsEpoch(timeline, epoch, view)),
        inputs,
        outputs,
        reports,
        withdrawals,
        tournaments: [],
        commitments: [],
        matches: [],
        matchAdvances: [],
        bondEvents: [],
    };
};
