import { iTournamentAbi } from "@cartesi/client/abi";
import { concat, decodeFunctionData, keccak256 } from "viem";
import { describe, expect, it } from "vitest";
import { prtScenarios } from "../../../src/providers/mocknode/scenarios/specs";
import {
    allowanceAt,
    buildPrtTimeline,
    getBondBalance,
    LEVELS,
    machineAfter,
    MAX_ALLOWANCE,
    RESPONSE_BUDGET,
    type PrtTimeline,
    type TournamentRecord,
} from "../../../src/providers/mocknode/scenarios/timeline";

const timelines = prtScenarios.map((spec) => buildPrtTimeline(spec, 1_000n));
const byName = (name: string) =>
    timelines.find((timeline) => timeline.name === name) as PrtTimeline;
const disputeOf = (name: string) => {
    const timeline = byName(name);
    return timeline.tournaments.filter(
        (tournament) => tournament.epochIndex === timeline.root.epochIndex,
    );
};

describe.each(timelines.map((timeline) => [timeline.name, timeline]))(
    "%s timeline",
    (_, timeline) => {
        it("should alternate the responders and follow the segment bits", () => {
            timeline.tournaments.forEach((tournament) =>
                tournament.matches.forEach((match) => {
                    match.advances.forEach((advance, index) => {
                        const mover = index % 2 === 0 ? match.one : match.two;
                        expect(advance.log.tx.from).toBe(mover.submitter);
                        const shift = tournament.height - 1n - BigInt(index);
                        expect(advance.segmentStartPosition >> shift).toBe(
                            (match.divergenceCycle - tournament.baseCycle) >>
                                (tournament.log2step + shift),
                        );
                    });
                    if (match.seal) {
                        expect(match.advances).toHaveLength(
                            Number(tournament.height - 1n),
                        );
                    }
                }),
            );
        });

        it("should base inner tournaments on the parent divergence leaf", () => {
            timeline.tournaments.forEach((tournament) =>
                tournament.matches
                    .filter((match) => match.child)
                    .forEach((match) => {
                        const inner = match.child as TournamentRecord;
                        expect(inner.level).toBe(tournament.level + 1n);
                        expect(inner.baseCycle).toBe(
                            tournament.baseCycle +
                                ((match.seal?.divergencePosition ?? 0n) <<
                                    tournament.log2step),
                        );
                        expect(inner.log2step + inner.height).toBe(
                            tournament.log2step,
                        );
                        expect(match.divergenceCycle >> 68n).toBeLessThan(3n);
                    }),
            );
        });

        it("should keep bond balances and clocks from going negative", () => {
            timeline.tournaments.forEach((tournament) => {
                expect(
                    getBondBalance(tournament, timeline.endsAt),
                ).toBeGreaterThanOrEqual(0n);
                tournament.commitments.forEach((commitment) =>
                    commitment.clock.forEach((change) =>
                        expect(change.allowance).toBeGreaterThanOrEqual(0n),
                    ),
                );
            });
        });

        it("should number logs uniquely within each block", () => {
            const keys = timeline.tournaments
                .flatMap((tournament) => [
                    ...tournament.bondEvents.map((event) => event.log),
                    ...tournament.commitments.map((item) => item.joined),
                    ...tournament.matches.flatMap((match) => [
                        match.created,
                        match.end.log,
                        ...match.advances.map((advance) => advance.log),
                    ]),
                ])
                .map((log) => `${log.tx.block}:${log.index}`);
            expect(new Set(keys).size).toBe(keys.length);
        });
    },
);

describe("PRT scenario outcomes", () => {
    it("should settle each root tournament as specified", () => {
        const winners = Object.fromEntries(
            timelines.map((timeline) => [
                timeline.name,
                timeline.root.winner === timeline.nodeClaim &&
                    timeline.nodeClaim !== null,
            ]),
        );
        expect(winners).toEqual({
            AppOne: false,
            AppTwo: true,
            AppThree: true,
            AppFour: true,
            AppFive: true,
            AppSix: false,
            AppSeven: false,
            AppEight: true,
            AppNine: true,
            AppTen: false,
            AppEleven: true,
            AppTwelve: true,
            AppThirteen: false,
            AppFourteen: true,
            AppFifteen: true,
            ParallelDisputes: true,
            LeafRaceTimeout: true,
            ExpiredInnerWinner: false,
            LateJoiner: true,
            DivergedNode: false,
        });
    });

    it("should go down to the leaf level with the level geometry", () => {
        const levels = disputeOf("AppEleven").map((tournament) => [
            tournament.level,
            tournament.log2step,
            tournament.height,
        ]);
        expect(levels).toEqual(
            LEVELS.map((level, index) => [
                BigInt(index),
                level.log2step,
                level.height,
            ]),
        );
        const leaf = disputeOf("AppEleven")[2].matches[0];
        expect(leaf.end.reason).toBe("STEP");
        expect(leaf.end.winner).toBe("TWO");
        expect(leaf.two.honest).toBe(true);
    });

    it("should pay the recovery as the bond plus a tenth of the rest", () => {
        const { root } = byName("AppEleven");
        const recovery = root.bondEvents.find(
            (event) => event.type === "BOND_RECOVERED",
        );
        if (recovery?.type !== "BOND_RECOVERED") throw new Error("missing");
        const balance = getBondBalance(root, recovery.log.tx.block - 1n);
        expect(recovery.payment).toBe(
            root.bondValue + (balance - root.bondValue) / 10n,
        );
        expect(recovery.payment + recovery.burned).toBe(balance);
        expect(getBondBalance(root, recovery.log.tx.block)).toBe(0n);
    });

    it("should time out the responder once its clock runs out", () => {
        const match = byName("AppFive").root.matches[0];
        expect(match.end).toMatchObject({ reason: "TIMEOUT", winner: "ONE" });
        expect(allowanceAt(match.two.clock, match.end.log.tx.block)).toBe(0n);
        expect(match.two.clearedAt).toBe(match.end.log.tx.block);
    });

    it("should pair the returning winner with the waiting claim", () => {
        const { root } = byName("AppFourteen");
        expect(root.matches).toHaveLength(2);
        expect(root.matches[1].two).toBe(root.matches[0].one);
        expect(root.matches[1].created.tx).toBe(root.matches[0].end.log.tx);
        expect(
            root.bondEvents.some(
                (event) =>
                    event.type === "PARTIAL_BOND_REFUND" && !event.success,
            ),
        ).toBe(true);
    });

    it("should eliminate a parent match whose inner tournament has no winner", () => {
        const tournaments = disputeOf("AppTen");
        expect(tournaments.map((tournament) => tournament.winner)).toEqual([
            null,
            null,
            null,
        ]);
        expect(tournaments[1].matches[0].end).toMatchObject({
            reason: "CHILD_TOURNAMENT",
            winner: "NONE",
        });
    });

    it("should hash each commitment from the root children it joins with", () => {
        timelines
            .flatMap((timeline) => timeline.tournaments)
            .flatMap((tournament) => tournament.commitments)
            .forEach((commitment) => {
                expect(commitment.commitment).toBe(
                    keccak256(concat(commitment.children)),
                );
                if (commitment.relayed) return;
                const join = decodeFunctionData({
                    abi: iTournamentAbi,
                    data: commitment.joined.tx.input,
                });
                expect(join.args?.slice(2)).toEqual(commitment.children);
            });
    });

    it("should win timeouts and inner tournaments with the winner's root children", () => {
        const callOf = (input: `0x${string}`) =>
            decodeFunctionData({ abi: iTournamentAbi, data: input });
        const timeout = byName("AppFive").root.matches[0];
        expect(callOf(timeout.end.log.tx.input).args?.slice(1)).toEqual(
            timeout.one.children,
        );
        const [root, inner] = disputeOf("AppEleven");
        const parent = root.matches[0];
        const winInner = callOf(parent.end.log.tx.input);
        expect(winInner.functionName).toBe("winInnerTournament");
        expect(winInner.args?.slice(1)).toEqual(parent.one.children);
        expect(inner.winner?.side).toBe("ONE");
    });

    it("should seal the empty epoch 0 at deployment and win it uncontested", () => {
        timelines.forEach((timeline) => {
            const [genesis, dispute] = timeline.epochs;
            expect(genesis.sealed.tx.block).toBe(timeline.anchor);
            expect(genesis.inputs).toEqual([0n, 0n]);
            expect(genesis.root.matches).toHaveLength(0);
            expect(genesis.root.winner).toBe(genesis.nodeClaim);
            expect(genesis.root.winner?.finalStateHash).toBe(
                machineAfter(timeline.name, 0n),
            );
            expect(genesis.root.finishedAt).toBe(
                timeline.anchor + MAX_ALLOWANCE,
            );
            expect(dispute.sealed.tx).toBe(genesis.accepted?.tx);
            expect(dispute.root.initialHash).toBe(
                machineAfter(timeline.name, 0n),
            );
            expect(
                timeline.inputs.every((input) => input.epochIndex === 1n),
            ).toBe(true);
        });
    });

    it("should seal the next epoch with each accepted result", () => {
        timelines.forEach((timeline) => {
            timeline.epochs.slice(1).forEach((epoch, index) => {
                const previous = timeline.epochs[index];
                expect(epoch.sealed.tx).toBe(previous.accepted?.tx);
                expect(previous.accepted?.tx.block).toBe(
                    (previous.staged?.tx.block ?? 0n) + 13n,
                );
            });
        });
        expect(byName("AppEleven").epochs).toHaveLength(3);
        expect(byName("AppSix").epochs).toHaveLength(2);
    });

    it("should stop the node when the accepted result is not its own", () => {
        const diverged = byName("DivergedNode");
        expect(diverged.applicationStatus).toMatchObject({
            status: "DIVERGED",
            block: diverged.root.finishedAt,
        });
        expect(diverged.epochs[2].root.commitments).toHaveLength(0);
        expect(byName("AppOne").applicationStatus).toMatchObject({
            status: "FAILED",
            block: byName("AppOne").root.closesAt,
        });
        expect(byName("AppSix").applicationStatus).toBeNull();
    });

    it("should run matches of the same tournament in parallel", () => {
        const [first, second, final] = byName("ParallelDisputes").root.matches;
        expect(second.created.tx.block).toBeLessThan(first.end.log.tx.block);
        expect([final.one, final.two]).toEqual([first.one, second.one]);
        expect(final.one.honest).toBe(true);
    });

    it("should race both clocks after a leaf seal", () => {
        const leaf = disputeOf("LeafRaceTimeout")[2].matches[0];
        const sealedAt = leaf.seal?.log.tx.block ?? 0n;
        expect(leaf.seal?.leaf).toBe(true);
        expect(leaf.end).toMatchObject({ reason: "TIMEOUT", winner: "TWO" });
        [leaf.one, leaf.two].forEach((side) =>
            expect(
                [...side.clock]
                    .reverse()
                    .find((change) => change.block <= sealedAt)?.running,
            ).toBe(true),
        );
        expect(allowanceAt(leaf.one.clock, leaf.end.log.tx.block)).toBe(0n);
        expect(leaf.two.honest).toBe(true);
    });

    it("should eliminate a parent match whose inner winner expired unused", () => {
        const [root, inner] = disputeOf("ExpiredInnerWinner");
        const match = root.matches[0];
        expect(inner.winner?.honest).toBe(true);
        expect(match.end.log.tx.block).toBeGreaterThanOrEqual(inner.expiresAt);
        expect(match.end).toMatchObject({
            reason: "CHILD_TOURNAMENT",
            winner: "NONE",
        });
        expect(root.winner).toBeNull();
    });

    it("should give a late joiner only the allowance left in the tournament", () => {
        const { root } = byName("LateJoiner");
        const late = root.commitments[1];
        const joinedAt = late.joined.tx.block;
        expect(joinedAt - root.created.tx.block).toBe(240n);
        expect(late.clock[0].allowance).toBe(MAX_ALLOWANCE - 240n);
        expect(root.matches[0].created.tx.block).toBe(joinedAt);
        expect(root.winner?.honest).toBe(true);
    });

    it("should charge a slow response only past the response budget", () => {
        const [, late] = byName("LateJoiner").root.commitments;
        late.clock.forEach((change, index) => {
            const previous = late.clock[index - 1];
            if (!previous?.running || change.running) return;
            const elapsed = change.block - previous.block;
            expect(previous.allowance - change.allowance).toBe(
                elapsed > RESPONSE_BUDGET ? elapsed - RESPONSE_BUDGET : 0n,
            );
        });
    });

    it("should build the same timeline shifted by the anchor", () => {
        const shifted = buildPrtTimeline(prtScenarios[10], 5_000n);
        expect(shifted.endsAt - 5_000n).toBe(
            byName("AppEleven").endsAt - 1_000n,
        );
        expect(shifted.txs.map((tx) => tx.hash)).toEqual(
            byName("AppEleven").txs.map((tx) => tx.hash),
        );
    });
});
