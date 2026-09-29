import { createCartesiPublicClient } from "@cartesi/client";
import { outputsAbi } from "@cartesi/client/abi";
import { custom, getAbiItem, keccak256, toFunctionSelector, toHex } from "viem";
import { describe, expect, it } from "vitest";
import {
    createCartesiHandlers,
    dispatch,
    handleRpcBody,
    type ApplicationData,
    type JsonRpcRequest,
    type NodeSnapshot,
} from "../../../src/providers/mocknode/rpc";
import {
    createBondEvent,
    createCommitment,
    createMatch,
    createMatchAdvanced,
    createTournament,
} from "../../../src/stories/prt";
import {
    createApplication,
    createEpoch,
    createInput,
    createOutput,
    createReport,
    createWithdrawal,
} from "../../../src/stories/rollups";

const application = createApplication({
    name: "honeypot",
    forecloseBlock: 90n,
    forecloseTransaction: keccak256(toHex("foreclose")),
    withdrawalConfig: {
        guardian: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
        log2LeavesPerAccount: 0n,
        log2MaxNumOfAccounts: 16n,
        accountsDriveStartIndex: 128n,
    },
});
const tournament = createTournament({
    snapshot: {
        standing: "ROOT_WINNER",
        candidate: keccak256(toHex(1)),
        winnerCommitment: keccak256(toHex(1)),
        bondRecovery: {
            disposition: "RECOVERABLE",
            claimer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            payment: 0n,
        },
    },
});
const inner = createTournament({
    address: "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
    level: 1n,
    parentTournamentAddress: tournament.address,
    parentMatchIdHash: keccak256(toHex("match")),
});
const match = createMatch({ leafSeal: null });
const advances = [0, 1, 2].map((index) =>
    createMatchAdvanced({
        idHash: match.idHash,
        blockNumber: BigInt(10 + index),
        txHash: keccak256(toHex(`advance-${index}`)),
        logIndex: BigInt(index),
        segmentStartPosition: BigInt(index),
    }),
);
const voucher = createOutput({
    index: 1n,
    inputIndex: 1n,
    decodedData: {
        type: "Voucher",
        destination: "0x86EA17052C8e335Ad830B54EF566274EAB46B852",
        value: 5n,
        payload: "0x",
    },
    outputHashesSiblings: [keccak256(toHex("sibling"))],
    executionTransactionHash: keccak256(toHex("executed")),
});
const pendingVoucher = createOutput({
    index: 2n,
    inputIndex: 2n,
    epochIndex: 1n,
    decodedData: {
        type: "DelegateCallVoucher",
        destination: "0xBB7c5367B74544542F5cE553Ed0DF4B3efAfEEdD",
        payload: "0x",
    },
    outputHashesSiblings: [keccak256(toHex("sibling"))],
});

const data: ApplicationData = {
    application,
    epochs: [
        createEpoch({ index: 0n, status: "CLAIM_ACCEPTED" }),
        createEpoch({
            index: 1n,
            status: "CLAIM_ACCEPTED",
            stagedAtBlock: 0n,
            tournamentAddress: tournament.address,
        }),
        createEpoch({ index: 2n, status: "OPEN" }),
    ],
    inputs: [0n, 1n, 2n].map((index) =>
        createInput({
            index,
            epochIndex: index === 2n ? 1n : 0n,
            status: index === 2n ? "NONE" : "ACCEPTED",
        }),
    ),
    outputs: [createOutput(), voucher, pendingVoucher],
    reports: [createReport(), createReport({ index: 1n, inputIndex: 1n })],
    tournaments: [tournament, inner],
    commitments: [
        createCommitment(),
        createCommitment({ commitment: keccak256(toHex(2)), logIndex: 1n }),
    ],
    matches: [match],
    matchAdvances: advances,
    bondEvents: [
        createBondEvent(),
        createBondEvent({
            type: "BOND_RECOVERED",
            txHash: keccak256(toHex("recovery")),
            refund: null,
            recovery: {
                commitment: keccak256(toHex(1)),
                claimer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                payment: 10n,
                burned: 90n,
            },
        }),
    ],
    withdrawals: [createWithdrawal(), createWithdrawal({ accountIndex: 1n })],
};

const snapshot: NodeSnapshot = {
    chainId: 13370,
    version: "2.0.0-alpha.12",
    applications: [
        data,
        {
            ...data,
            application: createApplication({
                name: "other",
                applicationAddress:
                    "0x245216Ec64BEF3A84D040cc9ABa864763434f29D",
            }),
        },
    ],
};

const handlers = createCartesiHandlers(() => snapshot);

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

const app = { application: application.name };

describe("mock node cartesi_* methods", () => {
    it("should round trip every entity through the client", async () => {
        expect(await client.getNodeInfo()).toEqual({
            chainId: 13370,
            version: "2.0.0-alpha.12",
            defaultBlock: "FINALIZED",
        });
        expect(await client.getApplication(app)).toEqual(application);
        expect(
            await client.getApplication({
                application: application.applicationAddress.toLowerCase(),
            }),
        ).toEqual(application);
        expect(await client.getEpoch({ ...app, epochIndex: 1n })).toEqual(
            data.epochs[1],
        );
        expect(
            await client.getEpochByVirtualIndex({ ...app, virtualIndex: 2n }),
        ).toEqual(data.epochs[2]);
        expect(await client.getLastAcceptedEpochIndex(app)).toBe(1n);
        expect(await client.getInput({ ...app, inputIndex: 1n })).toEqual(
            data.inputs[1],
        );
        expect(await client.getOutput({ ...app, outputIndex: 1n })).toEqual(
            voucher,
        );
        expect(await client.getOutput({ ...app, outputIndex: 2n })).toEqual(
            pendingVoucher,
        );
        expect(await client.getReport({ ...app, reportIndex: 1n })).toEqual(
            data.reports[1],
        );
        expect(
            await client.getTournament({ ...app, address: inner.address }),
        ).toEqual(inner);
        expect(
            await client.getTournament({ ...app, address: tournament.address }),
        ).toEqual(tournament);
        expect(
            await client.getCommitment({
                ...app,
                epochIndex: 0n,
                tournamentAddress: tournament.address,
                commitment: keccak256(toHex(2)),
            }),
        ).toEqual(data.commitments[1]);
        expect(
            await client.getMatch({
                ...app,
                epochIndex: 0n,
                tournamentAddress: tournament.address,
                idHash: match.idHash,
            }),
        ).toEqual(match);
        expect(
            await client.getMatchAdvance({
                ...app,
                epochIndex: 0n,
                tournamentAddress: tournament.address,
                idHash: match.idHash,
                txHash: advances[1].txHash,
                logIndex: 1n,
            }),
        ).toEqual(advances[1]);
        expect(
            await client.getBondEvent({
                ...app,
                txHash: keccak256(toHex("recovery")),
                logIndex: 1n,
            }),
        ).toEqual(data.bondEvents[1]);
        expect(
            await client.getWithdrawal({ ...app, accountIndex: 1n }),
        ).toEqual(data.withdrawals[1]);
    });

    it("should count processed inputs and executed and pending outputs", async () => {
        expect(await client.getProcessedInputCount(app)).toBe(2n);
        expect(await client.getExecutedOutputCount(app)).toBe(1n);
        expect(await client.getPendingExecutableOutputCount(app)).toBe(1n);
    });

    it("should paginate with the total count of the filtered list", async () => {
        const page = await client.listMatchAdvances({
            ...app,
            epochIndex: 0n,
            tournamentAddress: tournament.address,
            idHash: match.idHash,
            limit: 2,
            offset: 1,
        });
        expect(page.data).toEqual(advances.slice(1, 3));
        expect(page.pagination).toEqual({ totalCount: 3, limit: 2, offset: 1 });

        const descending = await client.listMatchAdvances({
            ...app,
            epochIndex: 0n,
            tournamentAddress: tournament.address,
            idHash: match.idHash,
            descending: true,
            limit: 1,
        });
        expect(descending.data).toEqual([advances[2]]);

        const all = await client.listApplications();
        expect(all.pagination).toEqual({ totalCount: 2, limit: 50, offset: 0 });
    });

    it("should filter every list by its parameters", async () => {
        const epochs = await client.listEpochs({
            ...app,
            status: ["OPEN", "CLAIM_REJECTED"],
        });
        expect(epochs.data.map((epoch) => epoch.index)).toEqual([2n]);
        const range = await client.listEpochs({ ...app, from: 1n, to: 2n });
        expect(range.pagination.totalCount).toBe(2);

        const inputs = await client.listInputs({ ...app, epochIndex: 1n });
        expect(inputs.data.map((input) => input.index)).toEqual([2n]);

        const vouchers = await client.listOutputs({
            ...app,
            outputType: ["Voucher", "DelegateCallVoucher"],
        });
        expect(vouchers.pagination.totalCount).toBe(2);
        const executed = await client.listOutputs({ ...app, executed: true });
        expect(executed.data).toEqual([voucher]);
        const byDestination = await client.listOutputs({
            ...app,
            voucherAddress: "0xbb7c5367b74544542f5ce553ed0df4b3efafeedd",
        });
        expect(byDestination.data).toEqual([pendingVoucher]);

        const reports = await client.listReports({ ...app, inputIndex: 1n });
        expect(reports.data).toEqual([data.reports[1]]);

        const inners = await client.listTournaments({
            ...app,
            parentTournamentAddress: tournament.address,
            parentMatchIdHash: inner.parentMatchIdHash ?? undefined,
        });
        expect(inners.data).toEqual([inner]);
        const roots = await client.listTournaments({ ...app, level: 0n });
        expect(roots.data).toEqual([tournament]);

        const commitments = await client.listCommitments({
            ...app,
            tournamentAddress: inner.address,
        });
        expect(commitments.pagination.totalCount).toBe(0);

        const matches = await client.listMatches({ ...app, epochIndex: 0n });
        expect(matches.data).toEqual([match]);

        const events = await client.listBondEvents({
            ...app,
            tournamentAddress: tournament.address,
        });
        expect(events.data).toEqual(data.bondEvents);

        const withdrawals = await client.listWithdrawals({
            ...app,
            accountIndex: 1n,
        });
        expect(withdrawals.data).toEqual([data.withdrawals[1]]);
    });

    it("should report unknown applications and missing resources", () => {
        expect(
            dispatch(handlers, {
                id: 1,
                method: "cartesi_getApplication",
                params: { application: "missing" },
            }),
        ).toMatchObject({ error: { code: -31002 } });
        expect(
            dispatch(handlers, {
                id: 1,
                method: "cartesi_getEpoch",
                params: { application: "honeypot", epoch_index: "0x9" },
            }),
        ).toMatchObject({ error: { code: -31001 } });
        expect(
            dispatch(handlers, {
                id: 1,
                method: "cartesi_getEpoch",
                params: { application: "honeypot" },
            }),
        ).toMatchObject({ error: { code: -32602 } });
    });

    it("should answer unknown methods with method not found", () => {
        expect(dispatch(handlers, { id: 7, method: "eth_foo" })).toEqual({
            jsonrpc: "2.0",
            id: 7,
            error: { code: -32601, message: "Method not found" },
        });
    });

    it("should answer a batch in order", () => {
        const selector = toFunctionSelector(
            getAbiItem({ abi: outputsAbi, name: "Notice" }),
        );
        const responses = handleRpcBody(handlers, [
            { id: 1, method: "cartesi_getChainId" },
            {
                id: 2,
                method: "cartesi_listOutputs",
                params: { application: "honeypot", output_type: selector },
            },
        ]);
        expect(responses).toMatchObject([
            { id: 1, result: { data: "0x343a" } },
            { id: 2, result: { pagination: { total_count: 1 } } },
        ]);
    });
});
