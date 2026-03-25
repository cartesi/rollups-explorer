import { Stack } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { getUnixTime, subMinutes, subSeconds } from "date-fns";
import { keccak256 } from "viem";
import { Hierarchy } from "../components/navigation/Hierarchy";
import { applications } from "../stories/data";
import { EpochPage } from "./EpochPage";

const meta = {
    title: "Pages/Epoch Details",
    component: EpochPage,
    tags: ["autodocs"],
} satisfies Meta<typeof EpochPage>;

export default meta;
type Story = StoryObj<typeof meta>;

type Props = Parameters<typeof EpochPage>[0];

const WithBreadcrumb = (props: Props) => {
    const app = props.application;
    return (
        <Stack gap="lg">
            <Hierarchy
                hierarchyConfig={[
                    { title: "Home", href: "/" },
                    { title: app.name, href: `/${app.name}` },
                    { title: `Epoch #${props.epoch.index}`, href: "#" },
                ]}
            />
            <EpochPage {...props} />
        </Stack>
    );
};

const currentDatetime = new Date();

export const Open: Story = {
    render: WithBreadcrumb,
    args: {
        application: applications[0],
        epoch: applications[0].epochs[4],
        inputs: [
            {
                index: 2n,
                status: "ACCEPTED",
                epochIndex: 0n,
                machineHash:
                    "0xd721e60f83c8fc277b2d2e23a24e77a4035ee1f482b64486a78dd5598f11364b",
                outputsHash:
                    "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                decodedData: {
                    payload:
                        "0x7b22616374696f6e223a226a616d2e7365744e465441646472657373222c2261646472657373223a22307865376631373235453737333443453238384638333637653142623134334539306262334630353132227d",
                    sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    applicationContract:
                        "0x7d6bcf9b5bb5bfb0ae793082c271931ec333e35d",
                    blockNumber: 1n,
                    blockTimestamp: BigInt(
                        getUnixTime(subSeconds(currentDatetime, 20)),
                    ),
                    chainId: 13370n,
                    index: 0n,
                    prevRandao: 1n,
                },
                blockNumber: 1n,
                rawData: "0x",
                transactionReference: keccak256("0x1"),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                index: 1n,
                status: "NONE",
                epochIndex: 0n,
                machineHash:
                    "0xd721e60f83c8fc277b2d2e23a24e77a4035ee1f482b64486a78dd5598f11364b",
                outputsHash:
                    "0xabbc4c1594a60078ddfc55bb7c96f1b5f4b3b67302c336cc98dc327fbe05e637",
                decodedData: {
                    payload:
                        "0x7b22616374696f6e223a226a616d2e7365744e465441646472657373222c2261646472657373223a22307865376631373235453737333443453238384638333637653142623134334539306262334630353132227d",
                    sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    applicationContract:
                        "0x7d6bcf9b5bb5bfb0ae793082c271931ec333e35d",
                    blockNumber: 1n,
                    blockTimestamp: BigInt(
                        getUnixTime(subMinutes(currentDatetime, 10)),
                    ),
                    chainId: 13370n,
                    index: 0n,
                    prevRandao: 1n,
                },
                blockNumber: 1n,
                rawData: "0x",
                transactionReference: keccak256("0x1"),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                index: 0n,
                status: "REJECTED",
                epochIndex: 0n,
                machineHash:
                    "0xd721e60f83c8fc277b2d2e23a24e77a4035ee1f482b64486a78dd5598f11364b",
                outputsHash:
                    "0x4eae49a33bf0456bfdcc9653b2b422b831acb318dc2e38b7d12a5af66a14ae78",
                decodedData: {
                    payload:
                        "0x7b22616374696f6e223a226a616d2e7365744e465441646472657373222c2261646472657373223a22307865376631373235453737333443453238384638333637653142623134334539306262334630353132227d",
                    sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    applicationContract:
                        "0x7d6bcf9b5bb5bfb0ae793082c271931ec333e35d",
                    blockNumber: 1n,
                    blockTimestamp: BigInt(
                        getUnixTime(subMinutes(currentDatetime, 12)),
                    ),
                    chainId: 13370n,
                    index: 0n,
                    prevRandao: 1n,
                },
                blockNumber: 1n,
                rawData: "0x",
                transactionReference: keccak256("0x1"),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ],
    },
};

export const ClosedInDispute: Story = {
    render: WithBreadcrumb,
    args: {
        application: applications[0],
        epoch: applications[0].epochs[3],
        inputs: [
            {
                index: 2n,
                status: "ACCEPTED",
                epochIndex: 0n,
                machineHash:
                    "0xd721e60f83c8fc277b2d2e23a24e77a4035ee1f482b64486a78dd5598f11364b",
                outputsHash:
                    "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                decodedData: {
                    applicationContract: applications[0].applicationAddress,
                    blockNumber: 1n,
                    blockTimestamp: BigInt(
                        getUnixTime(subSeconds(currentDatetime, 10)),
                    ),
                    chainId: 13370n,
                    index: 2n,
                    prevRandao: 1n,
                    payload:
                        "0x7b22616374696f6e223a226a616d2e7365744e465441646472657373222c2261646472657373223a22307865376631373235453737333443453238384638333637653142623134334539306262334630353132227d",
                    sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                },
                blockNumber: 1n,
                createdAt: new Date(),
                updatedAt: new Date(),
                rawData: "0x",
                transactionReference: keccak256("0x1"),
            },
            {
                index: 1n,
                status: "NONE",
                epochIndex: 0n,
                machineHash:
                    "0xd721e60f83c8fc277b2d2e23a24e77a4035ee1f482b64486a78dd5598f11364b",
                outputsHash:
                    "0xabbc4c1594a60078ddfc55bb7c96f1b5f4b3b67302c336cc98dc327fbe05e637",
                decodedData: {
                    payload:
                        "0x7b22616374696f6e223a226a616d2e7365744e465441646472657373222c2261646472657373223a22307865376631373235453737333443453238384638333637653142623134334539306262334630353132227d",
                    sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    applicationContract: applications[0].applicationAddress,
                    blockNumber: 1n,
                    blockTimestamp: BigInt(
                        getUnixTime(subMinutes(currentDatetime, 5)),
                    ),
                    chainId: 13370n,
                    index: 1n,
                    prevRandao: 1n,
                },
                blockNumber: 1n,
                createdAt: new Date(),
                updatedAt: new Date(),
                rawData: "0x",
                transactionReference: keccak256("0x1"),
            },
            {
                index: 0n,
                status: "REJECTED",
                epochIndex: 0n,
                machineHash:
                    "0xd721e60f83c8fc277b2d2e23a24e77a4035ee1f482b64486a78dd5598f11364b",
                outputsHash:
                    "0x4eae49a33bf0456bfdcc9653b2b422b831acb318dc2e38b7d12a5af66a14ae78",
                decodedData: {
                    applicationContract: applications[0].applicationAddress,
                    blockNumber: 1n,
                    blockTimestamp: BigInt(
                        getUnixTime(subMinutes(currentDatetime, 8)),
                    ),
                    chainId: 13370n,
                    index: 0n,
                    prevRandao: 1n,
                    payload:
                        "0x7b22616374696f6e223a226a616d2e7365744e465441646472657373222c2261646472657373223a22307865376631373235453737333443453238384638333637653142623134334539306262334630353132227d",
                    sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                },
                blockNumber: 1n,
                createdAt: new Date(),
                updatedAt: new Date(),
                rawData: "0x",
                transactionReference: keccak256("0x1"),
            },
        ],
    },
};

const authorityApp = applications[1];

export const AuthorityOpenEpoch: Story = {
    render: WithBreadcrumb,
    args: {
        application: authorityApp,
        epoch: {
            index: 0n,
            claimTransactionHash: null,
            commitment: null,
            commitmentProof: null,
            createdAt: currentDatetime,
            firstBlock: 0n,
            inputIndexLowerBound: 0n,
            inputIndexUpperBound: 1n,
            lastBlock: 0n,
            machineHash:
                "0x9ffb262ceb9b337cc4472dcaf27766b0395c63a23c3705968d0578a24b272890",
            status: "OPEN",
            tournamentAddress: null,
            updatedAt: currentDatetime,
            virtualIndex: 0n,
            outputsMerkleProof: null,
            outputsMerkleRoot: null,
        },
        inputs: [
            {
                index: 3n,
                status: "ACCEPTED",
                epochIndex: 0n,
                machineHash:
                    "0xd721e60f83c8fc277b2d2e23a24e77a4035ee1f482b64486a78dd5598f11364b",
                outputsHash:
                    "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                decodedData: {
                    applicationContract: authorityApp.applicationAddress,
                    blockNumber: 1n,
                    blockTimestamp: BigInt(
                        getUnixTime(subSeconds(currentDatetime, 10)),
                    ),
                    chainId: 13370n,
                    index: 2n,
                    prevRandao: 1n,
                    payload:
                        "0x7b22616374696f6e223a226a616d2e7365744e465441646472657373222c2261646472657373223a22307865376631373235453737333443453238384638333637653142623134334539306262334630353132227d",
                    sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                },
                blockNumber: 1n,
                createdAt: currentDatetime,
                updatedAt: currentDatetime,
                rawData: "0x",
                transactionReference: keccak256("0x1"),
            },
        ],
    },
};
