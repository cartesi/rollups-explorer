import type { Meta, StoryObj } from "@storybook/nextjs";
import { getUnixTime, subHours } from "date-fns";
import { http } from "msw";
import {
    getMockResponse,
    STORIES_RPC_URL,
    type GenericJSONRPCRequest,
} from "../stories/util";
import { ApplicationSummaryPage } from "./ApplicationSummaryPage";

const meta = {
    title: "Pages/Application/summary",
    component: ApplicationSummaryPage,
    // tags: ["autodocs"],
} satisfies Meta<typeof ApplicationSummaryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const date = new Date();

type Params = Parameters<typeof ApplicationSummaryPage>[0];

const params: Params = {
    application: {
        name: "aeron",
        accountsDriveMerkleRoot:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
        accountsDriveProvedBlock: 0n,
        accountsDriveProvedTransaction:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
        applicationAddress: "0x40a7C73a6a592D8697bE97254E273E6f3FB46000",
        claimStagingPeriod: 5n,
        consensusAddress: "0x0000000000000000000000000000000000000000",
        inputBoxAddress: "0x0000000000000000000000000000000000000000",
        templateHash:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
        consensusType: "PRT",
        status: "OK",
        enabled: true,
        processedInputs: 1n,
        dataAvailability: {
            type: "InputBox",
            inputBoxAddress: "0x0000000000000000000000000000000000000000",
        },
        executionParameters: {
            advanceIncCycles: 0x400000n,
            advanceMaxCycles: 0x3fffffffffffffffn,
            inspectIncCycles: 0x400000n,
            inspectMaxCycles: 0x3fffffffffffffffn,
            advanceIncDeadline: 0x2540be400n,
            advanceMaxDeadline: 0x29e8d60800n,
            inspectIncDeadline: 0x2540be400n,
            inspectMaxDeadline: 0x29e8d60800n,
            loadDeadline: 0x45d964b800n,
            storeDeadline: 0x29e8d60800n,
            fastDeadline: 0x12a05f200n,
            snapshotPolicy: "NONE",
            maxConcurrentInspects: 10,
            createdAt: date,
            updatedAt: date,
        },
        inputBoxBlock: 0n,
        lastAccountsDriveProvedCheckBlock: 0n,
        lastEpochCheckBlock: 0n,
        lastForecloseCheckBlock: 0n,
        lastInputCheckBlock: 0n,
        lastOutputCheckBlock: 0n,
        lastTournamentCheckBlock: 0n,
        lastWithdrawalCheckBlock: 0n,
        forecloseBlock: 0n,
        forecloseTransaction:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
        reason: null,
        createdAt: date,
        updatedAt: date,
        epochLength: 1024n,
        withdrawalConfig: {
            guardian: "0x0000000000000000000000000000000000000000",
            log2LeavesPerAccount: 0n,
            log2MaxNumOfAccounts: 20n,
            accountsDriveStartIndex: 33554432n,
            withdrawalOutputBuilder:
                "0x0000000000000000000000000000000000000000",
        },
    },
    withdrawals: {
        data: [],
        totalCount: 0,
        isLoading: false,
    },
    inputs: {
        data: [
            {
                epochIndex: 36n,
                index: 0n,
                blockNumber: 10830n,
                rawData:
                    "0x415bf3630000000000000000000000000000000000000000000000000000000000007a6900000000000000000000000040a7c73a6a592d8697be97254e273e6f3fb46000000000000000000000000000a632c5c05812c6a6149b7af5c56117d1d26038280000000000000000000000000000000000000000000000000000000000002a4e000000000000000000000000000000000000000000000000000000006984d54b46f0d3ef2cf902a71ed5d4f180ff2aa8cd21851eb9cff5425199d023c522f0e3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000034a074683b5be015f053b5dceb064c41fc9d11b6e50000000000000000000000000000000000000000000000001bc16d674ec80000000000000000000000000000",
                decodedData: {
                    chainId: 31337n,
                    applicationContract:
                        "0x40a7C73a6a592D8697bE97254E273E6f3FB46000",
                    sender: "0xA632c5c05812c6a6149B7af5C56117d1D2603828",
                    blockNumber: 10830n,
                    blockTimestamp: BigInt(getUnixTime(subHours(date, 10))),
                    prevRandao:
                        32087405413018063438212660768862326033482889634384336760477959572643178016995n,
                    index: 0n,
                    payload:
                        "0xa074683b5be015f053b5dceb064c41fc9d11b6e50000000000000000000000000000000000000000000000001bc16d674ec80000",
                },
                status: "ACCEPTED",
                machineHash:
                    "0x227d685f612568ed2d5b34fb8e3c19eef80097430498fd2b4a60e73c59e75e8a",
                outputsHash:
                    "0x97a8872d473a093269f65e4e14170fcf5d1383cd105d7215688f5e8c55f00553",
                transactionHash:
                    "0x75e1a936e92309ce05d3592905fb08637e64dab4131440c59ff053880ffde098",
                createdAt: date,
                updatedAt: date,
                logIndex: 0n,
            },
        ],
        totalCount: 1,
        isLoading: false,
    },
    outputs: {
        totalCount: 2,
        isLoading: false,
    },
    reports: {
        totalCount: 0,
        isLoading: false,
    },
    tournaments: {
        data: [
            {
                epochIndex: 51n,
                address: "0xBFCCffb1AE21227f49009540C5ac45BA45d96149",
                parentTournamentAddress: null,
                parentMatchIdHash: null,
                maxLevel: 3n,
                level: 0n,
                log2step: 44n,
                height: 48n,
                winnerCommitment: null,
                finalStateHash: null,
                finishedAtBlock: 0n,
                createdAt: date,
                updatedAt: date,
            },
            {
                epochIndex: 50n,
                address: "0x5267E8d41d9c6C1386DBfee95e00B8c6C5503Ba0",
                parentTournamentAddress: null,
                parentMatchIdHash: null,
                maxLevel: 3n,
                level: 0n,
                log2step: 44n,
                height: 48n,
                winnerCommitment:
                    "0x725e9d3febbdd79841345f187aacf343ee497214277f3cb330aca90319cbdd92",
                finalStateHash:
                    "0x227d685f612568ed2d5b34fb8e3c19eef80097430498fd2b4a60e73c59e75e8a",
                finishedAtBlock: 15390n,
                createdAt: date,
                updatedAt: date,
            },
        ],
        totalCount: 52,
        isLoading: false,
    },

    epochs: {
        data: [
            {
                index: 52n,
                firstBlock: 15391n,
                lastBlock: 15498n,
                inputIndexLowerBound: 1n,
                inputIndexUpperBound: 1n,
                tournamentAddress: null,
                machineHash: null,
                commitment: null,
                claimTransactionHash: null,
                status: "OPEN",
                virtualIndex: 52n,
                createdAt: date,
                updatedAt: date,
                commitmentProof: null,
                outputsMerkleProof: null,
                outputsMerkleRoot: null,
                stagedAtBlock: 0n,
            },
            {
                index: 51n,
                firstBlock: 15090n,
                lastBlock: 15391n,
                inputIndexLowerBound: 1n,
                inputIndexUpperBound: 1n,
                tournamentAddress: "0xBFCCffb1AE21227f49009540C5ac45BA45d96149",
                machineHash:
                    "0x227d685f612568ed2d5b34fb8e3c19eef80097430498fd2b4a60e73c59e75e8a",
                commitment:
                    "0x725e9d3febbdd79841345f187aacf343ee497214277f3cb330aca90319cbdd92",
                claimTransactionHash: null,
                status: "CLAIM_COMPUTED",
                virtualIndex: 51n,
                createdAt: date,
                updatedAt: date,
                commitmentProof: null,
                outputsMerkleProof: null,
                outputsMerkleRoot: null,
                stagedAtBlock: 0n,
            },
        ],
        totalCount: 53,
        isLoading: false,
    },
};

export const PRTApplication: Story = {
    args: params,
};

const authorityAppParams: Params = {
    application: {
        ...params.application,
        name: "NewApp",
        consensusType: "AUTHORITY",
    },
    withdrawals: {
        data: [],
        totalCount: 0,
        isLoading: false,
    },
    inputs: {
        data: [
            {
                epochIndex: 36n,
                index: 0n,
                blockNumber: 10830n,
                rawData:
                    "0x415bf3630000000000000000000000000000000000000000000000000000000000007a6900000000000000000000000040a7c73a6a592d8697be97254e273e6f3fb46000000000000000000000000000a632c5c05812c6a6149b7af5c56117d1d26038280000000000000000000000000000000000000000000000000000000000002a4e000000000000000000000000000000000000000000000000000000006984d54b46f0d3ef2cf902a71ed5d4f180ff2aa8cd21851eb9cff5425199d023c522f0e3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000034a074683b5be015f053b5dceb064c41fc9d11b6e50000000000000000000000000000000000000000000000001bc16d674ec80000000000000000000000000000",
                decodedData: {
                    chainId: 31337n,
                    applicationContract:
                        "0x40a7C73a6a592D8697bE97254E273E6f3FB46000",
                    sender: "0xA632c5c05812c6a6149B7af5C56117d1D2603828",
                    blockNumber: 10830n,
                    blockTimestamp: BigInt(getUnixTime(subHours(date, 4))),
                    prevRandao:
                        32087405413018063438212660768862326033482889634384336760477959572643178016995n,
                    index: 0n,
                    payload:
                        "0xa074683b5be015f053b5dceb064c41fc9d11b6e50000000000000000000000000000000000000000000000001bc16d674ec80000",
                },
                status: "ACCEPTED",
                machineHash:
                    "0x227d685f612568ed2d5b34fb8e3c19eef80097430498fd2b4a60e73c59e75e8a",
                outputsHash:
                    "0x97a8872d473a093269f65e4e14170fcf5d1383cd105d7215688f5e8c55f00553",
                transactionHash:
                    "0x75e1a936e92309ce05d3592905fb08637e64dab4131440c59ff053880ffde098",
                createdAt: date,
                updatedAt: date,
                logIndex: 0n,
            },
        ],
        totalCount: 1,
        isLoading: false,
    },
    outputs: {
        totalCount: 2,
        isLoading: false,
    },
    reports: {
        totalCount: 0,
        isLoading: false,
    },
    tournaments: {
        data: [],
        totalCount: 0,
        isLoading: false,
    },

    epochs: {
        data: [
            {
                index: 52n,
                firstBlock: 15391n,
                lastBlock: 15498n,
                inputIndexLowerBound: 1n,
                inputIndexUpperBound: 1n,
                tournamentAddress: null,
                machineHash: null,
                commitment: null,
                claimTransactionHash: null,
                status: "OPEN",
                virtualIndex: 52n,
                createdAt: date,
                updatedAt: date,
                commitmentProof: null,
                outputsMerkleProof: null,
                outputsMerkleRoot: null,
                stagedAtBlock: 0n,
            },
            {
                index: 51n,
                firstBlock: 15090n,
                lastBlock: 15391n,
                inputIndexLowerBound: 1n,
                inputIndexUpperBound: 1n,
                tournamentAddress: null,
                machineHash:
                    "0x227d685f612568ed2d5b34fb8e3c19eef80097430498fd2b4a60e73c59e75e8a",
                commitment:
                    "0x725e9d3febbdd79841345f187aacf343ee497214277f3cb330aca90319cbdd92",
                claimTransactionHash: null,
                status: "CLAIM_ACCEPTED",
                virtualIndex: 51n,
                createdAt: date,
                updatedAt: date,
                commitmentProof: null,
                outputsMerkleProof: null,
                outputsMerkleRoot: null,
                stagedAtBlock: 0n,
            },
        ],
        totalCount: 53,
        isLoading: false,
    },
};

export const AuthorityApplication: Story = {
    args: authorityAppParams,
};

const ForeclosedAppParams: Params = {
    ...authorityAppParams,
    application: {
        ...authorityAppParams.application,
        forecloseBlock: 15498n,
        forecloseTransaction:
            "0x0000000000000000000000000000000000000000000000000000000000000012",
    },
    withdrawals: {
        data: [],
        totalCount: 0,
        isLoading: false,
    },
};

export const ForeclosedApplicationDriveNotProved: Story = {
    args: ForeclosedAppParams,
};

const ForeclosedAppDriveProvedParams: Params = {
    ...ForeclosedAppParams,
    application: {
        ...ForeclosedAppParams.application,
        accountsDriveProvedBlock: 15498n,
        accountsDriveProvedTransaction:
            "0xe7f731cac0f0b32eb41e0506882246ad3d43b7a6d1448aee4460e3f3d3363bb9",
    },
    withdrawals: {
        data: [
            {
                accountIndex: 1n,
                account:
                    "0xe093040000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000",
                output: "0x10321e8b00000000000000000000000015e45e779ed795e5ac4643f6c428b161ccde7a6100000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000064d1660f9900000000000000000000000088a2120b7068e78692c8fd12e751d610b6377e4d000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000000000000000000493e000000000000000000000000000000000000000000000000000000000",
                blockNumber: 1831n,
                transactionHash:
                    "0xc3864881f1de35bd80a2cf57ebf98522cee8ad6aec4c70465bb708db1b428f80",
                logIndex: 1n,
                createdAt: new Date("2026-07-29T13:37:31.516Z"),
                updatedAt: new Date("2026-07-29T13:37:31.516Z"),
            },
            {
                accountIndex: 0n,
                account:
                    "0x80841e0000000000a074683b5be015f053b5dceb064c41fc9d11b6e500000000",
                output: "0x10321e8b00000000000000000000000015e45e779ed795e5ac4643f6c428b161ccde7a6100000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000064d1660f9900000000000000000000000088a2120b7068e78692c8fd12e751d610b6377e4d000000000000000000000000a074683b5be015f053b5dceb064c41fc9d11b6e500000000000000000000000000000000000000000000000000000000001e848000000000000000000000000000000000000000000000000000000000",
                blockNumber: 1691n,
                transactionHash:
                    "0xe7f731cac0f0b32eb41e0506882246ad3d43b7a6d1448aee4460e3f3d3363aa8",
                logIndex: 1n,
                createdAt: new Date("2026-07-29T13:35:12.518Z"),
                updatedAt: new Date("2026-07-29T13:35:12.518Z"),
            },
        ],
        totalCount: 2,
        isLoading: false,
    },
};

export const ForeclosedApplicationDriveProved: Story = {
    parameters: {
        msw: {
            handlers: [
                http.post(STORIES_RPC_URL, async ({ request }) => {
                    const body =
                        (await request.json()) as GenericJSONRPCRequest;

                    return getMockResponse(body);
                }),
            ],
        },
    },
    args: ForeclosedAppDriveProvedParams,
};
