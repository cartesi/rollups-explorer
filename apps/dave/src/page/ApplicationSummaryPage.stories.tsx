import type { Meta, StoryObj } from "@storybook/nextjs";
import { ApplicationSummaryPage } from "./ApplicationSummaryPage";

const meta = {
    title: "Pages/Application/summary",
    component: ApplicationSummaryPage,
    tags: ["autodocs"],
} satisfies Meta<typeof ApplicationSummaryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const date = new Date();

const params: Parameters<typeof ApplicationSummaryPage>[0] = {
    application: "aeron",
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
                    blockTimestamp: 1770313035n,
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
                transactionReference:
                    "0x75e1a936e92309ce05d3592905fb08637e64dab4131440c59ff053880ffde098",
                createdAt: date,
                updatedAt: date,
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
            },
        ],
        totalCount: 53,
        isLoading: false,
    },
};

export const Default: Story = {
    args: params,
};
