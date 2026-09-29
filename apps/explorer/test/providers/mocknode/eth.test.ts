import { iApplicationAbi, iTournamentAbi } from "@cartesi/client/abi";
import { safeErc20TransferAddress } from "@cartesi/client/abi";
import {
    createPublicClient,
    custom,
    decodeFunctionData,
    type Address,
} from "viem";
import { describe, expect, it } from "vitest";
import { getBondPool, toJoinBond } from "../../../src/lib/bondUtils";
import { createClockState } from "../../../src/providers/mocknode/clock";
import { createEthHandlers } from "../../../src/providers/mocknode/eth";
import {
    createNodeSource,
    getScenarioSchedules,
    scenarios,
} from "../../../src/providers/mocknode/node";
import {
    createCartesiHandlers,
    dispatch,
    type JsonRpcRequest,
} from "../../../src/providers/mocknode/rpc";
import type { RollupsTimeline } from "../../../src/providers/mocknode/scenarios/rollups";
import type { PrtTimeline } from "../../../src/providers/mocknode/scenarios/timeline";

const now = Date.UTC(2026, 8, 1);
const head = 30_000n;
const clock = createClockState(head, now, getScenarioSchedules());
const source = createNodeSource(
    () => clock,
    () => now,
);
const handlers = {
    ...createCartesiHandlers(source.node),
    ...createEthHandlers(source.chain),
};

const client = createPublicClient({
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

const timelineOf = <T>(name: string) => {
    const scenario = scenarios.find((item) => item.name === name);
    return scenario?.build(clock.anchors[name]) as T;
};

describe("mock node chain reads", () => {
    it("should report the head as the latest and finalized block", async () => {
        expect(await client.getBlockNumber()).toBe(head);
        const finalized = await client.getBlock({ blockTag: "finalized" });
        expect(finalized.number).toBe(head);
        expect(finalized.timestamp).toBe(BigInt(now / 1000));
        const past = await client.getBlock({ blockNumber: head - 10n });
        expect(past.timestamp).toBe(BigInt(now / 1000 - 120));
        expect(past.parentHash).toBe(
            (await client.getBlock({ blockNumber: head - 11n })).hash,
        );
        expect(await client.getChainId()).toBe(13370);
    });

    it("should serve join transactions with their calldata and bond", async () => {
        const eleven = timelineOf<PrtTimeline>("AppEleven");
        const { root } = eleven;
        const [commitment] = root.commitments;
        const transaction = await client.getTransaction({
            hash: commitment.joined.tx.hash,
        });
        expect(transaction.blockNumber).toBe(commitment.joined.tx.block);
        expect(
            toJoinBond(
                { address: root.address },
                {
                    commitment: commitment.commitment,
                    submitterAddress: commitment.submitter,
                    txHash: commitment.joined.tx.hash,
                },
                transaction,
            ),
        ).toMatchObject({ exact: true, value: root.bondValue });

        const nine = timelineOf<PrtTimeline>("AppNine");
        const relayed = nine.root.commitments[1];
        const relayedTx = await client.getTransaction({
            hash: relayed.joined.tx.hash,
        });
        expect(
            toJoinBond(
                { address: nine.root.address },
                {
                    commitment: relayed.commitment,
                    submitterAddress: relayed.submitter,
                    txHash: relayed.joined.tx.hash,
                },
                relayedTx,
                nine.root.bondValue,
            ),
        ).toMatchObject({ exact: false, value: nine.root.bondValue });
    });

    it("should serve the step proof of a leaf match win", async () => {
        const eleven = timelineOf<PrtTimeline>("AppEleven");
        const leaf = eleven.tournaments.find(
            (tournament) =>
                tournament.epochIndex === 1n && tournament.level === 2n,
        )?.matches[0];
        if (!leaf) throw new Error("missing leaf match");
        const transaction = await client.getTransaction({
            hash: leaf.end.log.tx.hash,
        });
        const call = decodeFunctionData({
            abi: iTournamentAbi,
            data: transaction.input,
        });
        expect(call.functionName).toBe("winLeafMatch");
    });

    it("should balance each bond pool with its deposits and payments", async () => {
        const fourteen = timelineOf<PrtTimeline>("AppFourteen");
        const twelve = timelineOf<PrtTimeline>("AppTwelve");
        for (const tournament of [
            ...fourteen.tournaments,
            ...twelve.tournaments,
        ]) {
            const balance = await client.getBalance({
                address: tournament.address,
            });
            const bondValue = await client.readContract({
                address: tournament.address,
                abi: iTournamentAbi,
                functionName: "bondValue",
            });
            expect(bondValue).toBe(tournament.bondValue);
            const pool = getBondPool(
                tournament.commitments.map((commitment) => ({
                    commitment: commitment.commitment,
                    depositor: commitment.submitter,
                    txHash: commitment.joined.tx.hash,
                    value: bondValue,
                    exact: true,
                })),
                tournament.commitments.length,
                source
                    .node()
                    .applications.flatMap((data) => data.bondEvents)
                    .filter(
                        (event) =>
                            event.tournamentAddress === tournament.address,
                    ),
            );
            expect(balance).toBe(
                pool.deposited - pool.refunded - pool.paid - pool.burned,
            );
        }
    });

    it("should read output executions and foreclosure from the application", async () => {
        const authority = timelineOf<RollupsTimeline>("EchoAuthority");
        const executed = authority.outputs.find(
            (output) => output.executed && output.executed.block <= head,
        );
        const pending = authority.outputs.find(
            (output) =>
                output.decoded.type !== "Notice" &&
                (!output.executed || output.executed.block > head),
        );
        const wasExecuted = (index: bigint) =>
            client.readContract({
                address: authority.address,
                abi: iApplicationAbi,
                functionName: "wasOutputExecuted",
                args: [index],
            });
        expect(await wasExecuted(executed!.index)).toBe(true);
        expect(await wasExecuted(pending!.index)).toBe(false);

        const isForeclosed = (address: Address) =>
            client.readContract({
                address,
                abi: iApplicationAbi,
                functionName: "isForeclosed",
            });
        expect(await isForeclosed(authority.address)).toBe(false);
        expect(
            await isForeclosed(
                timelineOf<RollupsTimeline>("ForeclosedWallet").address,
            ),
        ).toBe(true);
    });

    it("should serve contract code and revert unknown calls", async () => {
        expect(
            await client.getCode({ address: safeErc20TransferAddress }),
        ).toMatch(/^0x6080/);
        expect(
            dispatch(handlers, {
                id: 1,
                method: "eth_call",
                params: [{ to: safeErc20TransferAddress, data: "0x12345678" }],
            }),
        ).toMatchObject({ error: { message: "execution reverted" } });
        expect(
            dispatch(handlers, { id: 1, method: "eth_sendRawTransaction" }),
        ).toMatchObject({ error: { code: -32601 } });
    });
});
