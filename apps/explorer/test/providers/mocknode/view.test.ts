import { createCartesiPublicClient, type Tournament } from "@cartesi/client";
import { custom, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import {
    getMatchTimeoutAction,
    getTimeoutWinExpiry,
} from "../../../src/lib/disputeActions";
import { getTournamentOutcome, toCycle } from "../../../src/lib/prtUtils";
import { createClockState } from "../../../src/providers/mocknode/clock";
import {
    createNodeSource,
    getScenarioSchedules,
} from "../../../src/providers/mocknode/node";
import {
    createCartesiHandlers,
    dispatch,
    type JsonRpcRequest,
} from "../../../src/providers/mocknode/rpc";
import {
    prtScenarios,
    rollupsScenarios,
} from "../../../src/providers/mocknode/scenarios/specs";
import {
    allowanceAt,
    buildPrtTimeline,
    getBondBalance,
    getRecoveryPayment,
    type PrtTimeline,
} from "../../../src/providers/mocknode/scenarios/timeline";
import { viewPrtApplication } from "../../../src/providers/mocknode/scenarios/view";

const time = (block: bigint) => new Date(Number(block) * 12_000);

const timelines = prtScenarios.map((spec) => buildPrtTimeline(spec, 100n));

const headsOf = (timeline: PrtTimeline) => {
    const blocks = [...new Set(timeline.txs.map((tx) => tx.block))];
    return [
        ...blocks.filter((_, index) => index % 7 === 0),
        timeline.endsAt,
        timeline.endsAt + 200n,
    ];
};

const byAddress = (tournaments: Tournament[]) =>
    new Map(tournaments.map((tournament) => [tournament.address, tournament]));

const byName = (name: string) =>
    timelines.find((timeline) => timeline.name === name) as PrtTimeline;

describe.each(timelines.map((timeline) => [timeline.name, timeline]))(
    "%s view",
    (_, timeline) => {
        const views = headsOf(timeline).map((head) => ({
            head,
            data: viewPrtApplication(timeline, { head, time }),
        }));

        it("should only report what exists at the head", () => {
            views.forEach(({ head, data }) => {
                [
                    ...data.commitments,
                    ...data.matches,
                    ...data.matchAdvances,
                    ...data.bondEvents,
                    ...data.inputs,
                ].forEach((item) =>
                    expect(item.blockNumber).toBeLessThanOrEqual(head),
                );
                data.tournaments.forEach((tournament) =>
                    expect(tournament.startInstant).toBeLessThanOrEqual(head),
                );
            });
        });

        it("should derive heights and responders from the advances", () => {
            views.forEach(({ data }) => {
                const tournaments = byAddress(data.tournaments);
                data.matches.forEach((match) => {
                    const tournament = tournaments.get(
                        match.tournamentAddress,
                    ) as Tournament;
                    const advances = data.matchAdvances.filter(
                        (advance) => advance.idHash === match.idHash,
                    );
                    const { snapshot } = match;
                    if (match.deletionReason !== "NOT_DELETED") {
                        expect(snapshot.phase).toBe("UNINITIALIZED");
                        return;
                    }
                    if (snapshot.phase === "BISECTING") {
                        expect(snapshot.bisection.currentHeight).toBe(
                            tournament.height - BigInt(advances.length),
                        );
                    }
                    if (
                        snapshot.phase === "BISECTING" ||
                        snapshot.phase === "READY_TO_SEAL"
                    ) {
                        expect(snapshot.bisection.responder).toBe(
                            advances.length % 2 === 0 ? "ONE" : "TWO",
                        );
                        expect(snapshot.bisection.segmentStartCycle).toBe(
                            toCycle(
                                tournament,
                                snapshot.bisection.segmentStartPosition,
                            ),
                        );
                    }
                    if (snapshot.phase === "SEALED") {
                        expect(advances).toHaveLength(
                            Number(tournament.height - 1n),
                        );
                    }
                });
            });
        });

        it("should align inner tournaments with the parent divergence", () => {
            views.forEach(({ data }) => {
                const tournaments = byAddress(data.tournaments);
                data.tournaments
                    .filter((tournament) => tournament.parentMatchIdHash)
                    .forEach((inner) => {
                        const parent = tournaments.get(
                            inner.parentTournamentAddress ?? "0x",
                        ) as Tournament;
                        const match = data.matches.find(
                            (item) => item.idHash === inner.parentMatchIdHash,
                        );
                        if (match?.snapshot.phase === "SEALED") {
                            expect(inner.baseCycle).toBe(
                                match.snapshot.sealed.divergenceCycle,
                            );
                        }
                        expect(inner.level).toBe(parent.level + 1n);
                        expect(inner.baseCycle).toBeGreaterThanOrEqual(
                            parent.baseCycle,
                        );
                    });
            });
        });

        it("should keep clocks consistent with the match responder", () => {
            views.forEach(({ data }) => {
                const tournaments = byAddress(data.tournaments);
                data.commitments.forEach((commitment) => {
                    const { snapshot } = commitment;
                    const tournament = tournaments.get(
                        commitment.tournamentAddress,
                    ) as Tournament;
                    expect(snapshot.asOfBlock).toBe(
                        tournament.snapshot.asOfBlock,
                    );
                    if (!snapshot.clockRunning) {
                        expect(snapshot.clockDeadline).toBe(0n);
                        return;
                    }
                    expect(snapshot.clockDeadline).toBeGreaterThan(0n);
                    const match = data.matches.find(
                        (item) =>
                            item.deletionReason === "NOT_DELETED" &&
                            item.tournamentAddress ===
                                commitment.tournamentAddress &&
                            [item.commitmentOne, item.commitmentTwo].includes(
                                commitment.commitment,
                            ),
                    );
                    expect(
                        match !== undefined || snapshot.claimer === zeroAddress,
                    ).toBe(true);
                });
            });
        });

        it("should settle standings and bonds once the tournament finishes", () => {
            const last = views[views.length - 1];
            last.data.tournaments.forEach((tournament) => {
                const { snapshot } = tournament;
                const record = timeline.tournaments.find(
                    (item) => item.address === tournament.address,
                );
                if (!record || record.finishedAt > last.head) return;
                expect(snapshot.finishedAtBlock).toBe(record.finishedAt);
                const outcome = getTournamentOutcome(snapshot);
                if (snapshot.bondRecovery.disposition === "NO_WINNER") {
                    expect(outcome.status).toBe("noWinner");
                } else {
                    expect(["winner", "expired", "provisional"]).toContain(
                        outcome.status,
                    );
                }
                if (snapshot.bondRecovery.disposition === "RECOVERABLE") {
                    expect(snapshot.bondRecovery.payment).toBe(
                        getRecoveryPayment(
                            getBondBalance(record, snapshot.asOfBlock),
                            record.bondValue,
                        ),
                    );
                }
            });
        });
    },
);

describe("PRT scenario views", () => {
    const eleven = byName("AppEleven");

    it("should move each sealed epoch through the node's claim statuses", () => {
        const [genesis, dispute] = eleven.epochs;
        const sealedAt = dispute.sealed.tx.block;
        const statusAt = (head: bigint) =>
            viewPrtApplication(eleven, { head, time }).epochs.find(
                (epoch) => epoch.index === 1n,
            )?.status;
        expect(
            [
                sealedAt - 1n,
                sealedAt,
                sealedAt + 1n,
                sealedAt + 2n,
                dispute.staged?.tx.block ?? 0n,
                dispute.accepted?.tx.block ?? 0n,
            ].map(statusAt),
        ).toEqual([
            "OPEN",
            "CLOSED",
            "INPUTS_PROCESSED",
            "CLAIM_COMPUTED",
            "CLAIM_STAGED",
            "CLAIM_ACCEPTED",
        ]);
        const last = viewPrtApplication(eleven, { head: eleven.endsAt, time });
        expect(last.epochs.map((epoch) => epoch.status)).toEqual([
            "CLAIM_ACCEPTED",
            "CLAIM_ACCEPTED",
            "CLAIM_COMPUTED",
            "OPEN",
        ]);
        expect(last.epochs[0]).toMatchObject({
            firstBlock: eleven.anchor,
            lastBlock: genesis.sealed.tx.block,
            claimTransactionHash: dispute.sealed.tx.hash,
        });
        expect(last.epochs[1].firstBlock).toBe(last.epochs[0].lastBlock);
        expect(last.epochs[3].lastBlock).toBe(eleven.endsAt);
        expect(last.inputs.map((input) => input.epochIndex)).toEqual([
            1n,
            1n,
            1n,
        ]);
        expect(last.application.processedInputs).toBe(3n);
    });

    it("should leave a lost or failed epoch computed and flag a diverged node", () => {
        const diverged = byName("DivergedNode");
        const after = viewPrtApplication(diverged, {
            head: diverged.endsAt,
            time,
        });
        expect(after.application).toMatchObject({ status: "DIVERGED" });
        expect(after.epochs.map((epoch) => epoch.status)).toEqual([
            "CLAIM_ACCEPTED",
            "CLAIM_COMPUTED",
            "CLOSED",
            "OPEN",
        ]);
        const before = viewPrtApplication(diverged, {
            head: diverged.root.finishedAt - 1n,
            time,
        });
        expect(before.application.status).toBe("OK");
        const six = byName("AppSix");
        const failed = viewPrtApplication(six, { head: six.endsAt, time });
        expect(failed.application.status).toBe("OK");
        expect(failed.epochs[1].status).toBe("CLAIM_COMPUTED");
        expect(failed.tournaments[1].snapshot.standing).toBe("ROOT_FAILED");
        const one = byName("AppOne");
        expect(
            viewPrtApplication(one, { head: one.endsAt, time }).application
                .status,
        ).toBe("FAILED");
    });

    it("should report a live timeout outcome once the responder runs out", () => {
        const five = byName("AppFive");
        const match = five.root.matches[0];
        const head = match.end.log.tx.block - 1n;
        const data = viewPrtApplication(five, { head, time });
        const view = data.matches.find((item) => item.idHash === match.idHash);
        expect(view?.snapshot.timeoutOutcome).toBe("ONE_WINS");
        const [one, two] = data.commitments.filter(
            (item) => item.tournamentAddress === five.root.address,
        );
        expect(one.snapshot.clockRunning).toBe(false);
        expect(two.snapshot.clockRunning).toBe(true);
        expect(view?.snapshot.deferredCharge).toBe(
            head - two.snapshot.clockDeadline,
        );
    });

    it("should charge the survivor each overdue block until both can be eliminated", () => {
        const six = byName("AppSix");
        const record = six.root.matches[0];
        const running = [...record.one.clock]
            .reverse()
            .find((change) => change.running);
        const deadline = (running?.block ?? 0n) + (running?.allowance ?? 0n);
        const kept = allowanceAt(record.two.clock, deadline);
        const at = (head: bigint) => {
            const data = viewPrtApplication(six, { head, time });
            const match = data.matches.find(
                (item) => item.idHash === record.idHash,
            );
            if (!match) throw new Error("missing match");
            const survivor = data.commitments.find(
                ({ commitment }) => commitment === match.commitmentTwo,
            );
            return {
                snapshot: match.snapshot,
                action: getMatchTimeoutAction(match),
                expiry: getTimeoutWinExpiry(match, survivor),
            };
        };
        expect(at(deadline - 1n).action).toBeNull();
        expect(at(deadline).action).toEqual({ kind: "win", side: "TWO" });
        expect(at(deadline).expiry).toBe(kept);
        const last = at(deadline + kept - 1n);
        expect(last.snapshot.deferredCharge).toBe(kept - 1n);
        expect(last.action).toEqual({ kind: "win", side: "TWO" });
        expect(last.expiry).toBe(1n);
        const out = at(deadline + kept);
        expect(out.action).toEqual({ kind: "eliminate" });
        expect(out.snapshot.deferredCharge).toBe(0n);
    });

    it("should let the running survivor of a leaf race win until its own deadline", () => {
        const race = byName("LeafRaceTimeout");
        const record = race.tournaments.find(
            (tournament) =>
                tournament.epochIndex === 1n && tournament.level === 2n,
        )?.matches[0];
        if (!record) throw new Error("missing leaf match");
        const head = record.end.log.tx.block - 1n;
        const data = viewPrtApplication(race, { head, time });
        const match = data.matches.find(
            (item) => item.idHash === record.idHash,
        );
        if (!match) throw new Error("missing match");
        const survivor = data.commitments.find(
            ({ commitment }) => commitment === match.commitmentTwo,
        );
        expect(match.leafSeal).not.toBeNull();
        expect(match.snapshot.timeoutOutcome).toBe("TWO_WINS");
        expect(match.snapshot.deferredCharge).toBe(0n);
        expect(survivor?.snapshot.clockRunning).toBe(true);
        expect(getTimeoutWinExpiry(match, survivor)).toBe(
            (survivor?.snapshot.clockDeadline ?? 0n) - head,
        );
    });

    it("should show a provisional inner winner until it expires", () => {
        const inner = eleven.tournaments.find(
            (tournament) =>
                tournament.epochIndex === 1n && tournament.level === 1n,
        );
        if (!inner) throw new Error("missing inner tournament");
        const at = (head: bigint) =>
            viewPrtApplication(eleven, { head, time }).tournaments.find(
                (tournament) => tournament.address === inner.address,
            )?.snapshot;
        expect(at(inner.finishedAt)?.standing).toBe("INNER_WINNER");
        expect(at(inner.finishedAt)?.winnerExpiresAt).toBe(inner.expiresAt);
        expect(at(inner.finishedAt)?.bondRecovery.disposition).toBe(
            "RECOVERABLE",
        );
        expect(at(inner.expiresAt)?.standing).toBe(
            "INNER_ELIMINABLE_WINNER_EXPIRED",
        );
        expect(at(inner.expiresAt)?.candidate).toBe(inner.winner?.commitment);
        expect(at(inner.expiresAt + 50n)?.asOfBlock).toBe(inner.expiresAt);
    });

    it("should round trip the generated data through the client", async () => {
        const now = Date.UTC(2026, 8, 1);
        const clock = createClockState(20_000n, now, getScenarioSchedules());
        const handlers = createCartesiHandlers(
            createNodeSource(
                () => clock,
                () => now,
            ),
        );
        const client = createCartesiPublicClient({
            transport: custom({
                request: async (request) => {
                    const response = dispatch(handlers, {
                        id: 1,
                        ...request,
                    } as JsonRpcRequest);
                    if ("error" in response) throw response.error;
                    return response.result;
                },
            }),
        });
        const applications = await client.listApplications();
        expect(applications.pagination.totalCount).toBe(
            prtScenarios.length + rollupsScenarios.length,
        );
        const application = "AppFourteen";
        const tournaments = await client.listTournaments({
            application,
            epochIndex: 1n,
        });
        expect(tournaments.pagination.totalCount).toBe(5);
        const [root] = tournaments.data;
        expect(root.snapshot.standing).toBe("ROOT_WINNER");
        const matches = await client.listMatches({
            application,
            tournamentAddress: root.address,
        });
        const advances = await client.listMatchAdvances({
            application,
            epochIndex: 1n,
            tournamentAddress: root.address,
            idHash: matches.data[0].idHash,
        });
        expect(advances.pagination.totalCount).toBe(47);
        const events = await client.listBondEvents({
            application,
            limit: 10_000,
        });
        expect(
            events.data.filter((event) => event.type === "BOND_RECOVERED"),
        ).toHaveLength(6);
        const epochs = await client.listEpochs({ application });
        expect(epochs.data[1].commitment).not.toBeNull();
        expect(epochs.data[1].commitmentProof).toBeNull();
        const epoch = await client.getEpoch({ application, epochIndex: 1n });
        expect(epoch.commitmentProof).not.toBeNull();
    });
});
