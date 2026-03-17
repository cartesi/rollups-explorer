import type {
    Application,
    Commitment,
    Epoch,
    Match,
    MatchAdvanced,
    SnapshotPolicy,
    Tournament,
} from "@cartesi/viem";
import { inputBoxAddress } from "@cartesi/viem/abi";
import {
    keccak256,
    numberToHex,
    zeroHash,
    type Address,
    type Hash,
} from "viem";
import { generateMatchID, generateTournamentAddress, mulberry32 } from "./util";

// the following are types for a top down hierarchy
// Application -> Epoch -> Tournament -> [Match, Commitment] -> [MatchAdvanced, Tournament]
type MatchWithAdvancesAndTournament = Match & {
    advances?: MatchAdvanced[];
    tournament?: TournamentWithMatchesAndCommitments;
};
type TournamentWithMatchesAndCommitments = Tournament & {
    commitments?: Commitment[];
    matches?: MatchWithAdvancesAndTournament[];
};
export type EpochWithTournament = Epoch & {
    tournament?: TournamentWithMatchesAndCommitments;
};
export type ApplicationEpochs = Application & { epochs: EpochWithTournament[] };

const currentDate = new Date();
const executionParameters = {
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
    snapshotPolicy: "NONE" as SnapshotPolicy,
    maxConcurrentInspects: 10,
    createdAt: currentDate,
    updatedAt: currentDate,
};

export const randomAdvances = (options: {
    count: number;
    epochIndex?: bigint;
    idHash?: Hash;
    leftOfTwo?: Hash;
    now: number;
    seed?: number;
    tournamentAddress: Address;
}) => {
    const rng = mulberry32(options.seed ?? 0);
    const { count, epochIndex, now, tournamentAddress } = options;
    const idHash =
        options.idHash ??
        "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6";
    const leftOfTwo =
        options.leftOfTwo ??
        "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002";
    return Array.from<number>({ length: count }).reduce<MatchAdvanced[]>(
        (array, _, i) => [
            ...array,
            {
                blockNumber: BigInt(i),
                createdAt: new Date(now + i * 60),
                epochIndex: epochIndex ?? 0n,
                idHash,
                leftNode: keccak256(numberToHex(i)),
                otherParent:
                    i === 0
                        ? leftOfTwo
                        : rng() < 0.5
                          ? array[i - 1].leftNode
                          : zeroHash,
                tournamentAddress,
                txHash: keccak256(numberToHex(i)),
                updatedAt: new Date(now + i * 60),
            },
        ],
        [],
    );
};

export const applications: ApplicationEpochs[] = [
    {
        applicationAddress: "0x4c1E74EF88a75C24e49eddD9f70D82A94D19251c",
        name: "honeypot",
        consensusType: "PRT",
        state: "ENABLED",
        processedInputs: 8n,
        consensusAddress: "0x44dc8f7bfa033e464cd672561aa62ad147f24012",
        inputBoxAddress,
        dataAvailability: {
            type: "InputBox",
            inputBoxAddress,
        },
        lastEpochCheckBlock: 0xa2en,
        lastInputCheckBlock: 0xa2en,
        lastOutputCheckBlock: 0xa2en,
        templateHash:
            "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
        reason: null,
        createdAt: currentDate,
        updatedAt: currentDate,
        epochLength: 0n,
        executionParameters,
        inputBoxBlock: 0x3n,
        epochs: [
            {
                index: 0n,
                firstBlock: 0x3n,
                lastBlock: 0x1fn,
                inputIndexLowerBound: 0x0n,
                inputIndexUpperBound: 0x1n,
                virtualIndex: 0n,
                machineHash:
                    "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                claimHash:
                    "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                claimTransactionHash:
                    "0xd6dcb8aafbdc19a690c242625c45e2e5d0cbe6369905ae3447df7b6005478d30",
                commitment:
                    "0xe182400d9ebc0daa415b1de07dd5e74467693239ff43773af4d7401c456a317c",
                tournamentAddress: "0xa2835312696afa86c969e40831857dbb1412627f",
                status: "CLAIM_ACCEPTED",
                createdAt: currentDate,
                updatedAt: currentDate,
                tournament: {
                    address: generateTournamentAddress(0, 1_345_972_719),
                    createdAt: currentDate,
                    epochIndex: 0n,
                    finalStateHash: null,
                    finishedAtBlock: 0n,
                    height: 48n,
                    log2step: 1n,
                    maxLevel: 3n,
                    parentMatchIdHash: null,
                    parentTournamentAddress: null,
                    updatedAt: currentDate,
                    winnerCommitment: keccak256("0x1"),
                    level: 0n,
                },
            },
            {
                index: 0x1n,
                firstBlock: 0x1fn,
                lastBlock: 0x159n,
                inputIndexLowerBound: 0x1n,
                inputIndexUpperBound: 0x4n,
                virtualIndex: 0x1n,
                machineHash:
                    "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                claimHash:
                    "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                claimTransactionHash:
                    "0xda1118c110f5c8b2b252df62c382338e2da79cf03ad5d698f657ffe1f7827420",
                commitment:
                    "0x2fc2159691acab181f7e24c1e76c327a1640f09d7954cafae503534957cd1807",
                tournamentAddress: "0xecfe2229369f17d73c1b109254490364d9c8d4ec",
                status: "CLAIM_ACCEPTED",
                createdAt: currentDate,
                updatedAt: currentDate,
                tournament: {
                    address: generateTournamentAddress(
                        1_345_972_719,
                        3_220_829_192,
                    ),
                    createdAt: currentDate,
                    epochIndex: 1n,
                    finalStateHash: null,
                    finishedAtBlock: 0n,
                    height: 48n,
                    level: 0n,
                    log2step: 1n,
                    maxLevel: 3n,
                    parentMatchIdHash: null,
                    parentTournamentAddress: null,
                    updatedAt: currentDate,
                    winnerCommitment: keccak256("0x2"),
                },
            },
            {
                index: 2n,
                firstBlock: 0x159n,
                lastBlock: 0x2d8n,
                inputIndexLowerBound: 0x4n,
                inputIndexUpperBound: 0x7n,
                virtualIndex: 0x2n,
                machineHash:
                    "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                claimHash:
                    "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                claimTransactionHash:
                    "0xbbfbbf103ab4a1119d2bfac6124cb80d84e0e71452ae1aea2d15d954b51e7197",
                commitment:
                    "0x165c8ed31a8a1d3d5a7c6ba5240bd268559a39c244a282382c26e542eb3d8830",
                tournamentAddress: "0x33fb8b5f300fe6a989319a408e0acc81a57d2ad8",
                status: "CLAIM_ACCEPTED",
                createdAt: currentDate,
                updatedAt: currentDate,
                tournament: {
                    address: generateTournamentAddress(
                        3_220_829_192,
                        5_911_918_810,
                    ),
                    createdAt: currentDate,
                    epochIndex: 2n,
                    finalStateHash: null,
                    finishedAtBlock: 0n,
                    height: 48n,
                    level: 0n,
                    log2step: 1n,
                    maxLevel: 3n,
                    parentMatchIdHash: null,
                    parentTournamentAddress: null,
                    updatedAt: currentDate,
                    winnerCommitment: keccak256("0x3"),
                },
            },
            {
                index: 3n,
                firstBlock: 0x2d8n,
                lastBlock: 0x457n,
                inputIndexLowerBound: 0x7n,
                inputIndexUpperBound: 0xan,
                virtualIndex: 0x3n,
                machineHash:
                    "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                claimHash:
                    "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                claimTransactionHash:
                    "0x59ec08bd457a7df7501f9fa50719d5eddb2cf5e4089fffe5abaa5791c4833d90",
                commitment:
                    "0x308d4b4c7e05d1ab1bcb0414184c11136b652f4767dc010ac3eab33f61b449bc",
                tournamentAddress: "0x61bcab9d0d8b554009824292d2d6855dfa3aab86",
                status: "CLAIM_ACCEPTED",
                createdAt: currentDate,
                updatedAt: currentDate,
                tournament: {
                    address: generateTournamentAddress(
                        5_911_918_810,
                        9_918_817_817,
                    ),
                    createdAt: currentDate,
                    epochIndex: 3n,
                    finalStateHash: null,
                    finishedAtBlock: 1n,
                    height: 48n,
                    log2step: 1n,
                    maxLevel: 3n,
                    parentMatchIdHash: null,
                    parentTournamentAddress: null,
                    updatedAt: currentDate,
                    level: 0n,
                    winnerCommitment: null,
                    matches: [
                        {
                            blockNumber: 1n,
                            commitmentOne: keccak256("0x4"),
                            commitmentTwo: keccak256("0x5"),
                            createdAt: currentDate,
                            deletionBlockNumber: null,
                            deletionReason: "NOT_DELETED",
                            deletionTxHash: null,
                            epochIndex: 0n,
                            idHash: generateMatchID(
                                keccak256("0x4"),
                                keccak256("0x5"),
                            ),
                            leftOfTwo:
                                "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
                            advances: randomAdvances({
                                count: 47,
                                now: currentDate.getTime(),
                                tournamentAddress: generateTournamentAddress(
                                    5_911_918_810,
                                    9_918_817_817,
                                ),
                                epochIndex: 3n,
                            }),
                            tournamentAddress: generateTournamentAddress(
                                5_911_918_810,
                                9_918_817_817,
                            ),
                            txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
                            updatedAt: currentDate,
                            winnerCommitment: "NONE",
                            tournament: {
                                address: generateTournamentAddress(
                                    7_102_817_919,
                                    7_402_918_071,
                                ),
                                createdAt: currentDate,
                                epochIndex: 3n,
                                finalStateHash: null,
                                finishedAtBlock: 1n,
                                height: 27n,
                                log2step: 1n,
                                level: 1n,
                                maxLevel: 3n,
                                parentMatchIdHash: generateMatchID(
                                    keccak256("0x4"),
                                    keccak256("0x5"),
                                ),
                                parentTournamentAddress:
                                    generateTournamentAddress(
                                        5_911_918_810,
                                        9_918_817_817,
                                    ),
                                updatedAt: currentDate,
                                winnerCommitment: null,
                                matches: [
                                    {
                                        advances: randomAdvances({
                                            count: 27,
                                            now: currentDate.getTime(),
                                            tournamentAddress:
                                                generateTournamentAddress(
                                                    7_102_817_919,
                                                    7_402_918_071,
                                                ),
                                            epochIndex: 4n,
                                        }),
                                        blockNumber: 1n,
                                        createdAt: currentDate,
                                        deletionBlockNumber: null,
                                        deletionReason: "NOT_DELETED",
                                        deletionTxHash: null,
                                        epochIndex: 3n,
                                        leftOfTwo:
                                            "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
                                        tournamentAddress:
                                            generateTournamentAddress(
                                                7_102_817_919,
                                                7_402_918_071,
                                            ),
                                        txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
                                        updatedAt: currentDate,
                                        winnerCommitment: "NONE",
                                        idHash: generateMatchID(
                                            keccak256("0x6"),
                                            keccak256("0x7"),
                                        ),
                                        commitmentOne: keccak256("0x6"),
                                        commitmentTwo: keccak256("0x7"),
                                        tournament: {
                                            address: generateTournamentAddress(
                                                7_204_918_919,
                                                7_205_024_571,
                                            ),
                                            createdAt: currentDate,
                                            epochIndex: 3n,
                                            finalStateHash: null,
                                            finishedAtBlock: 1n,
                                            log2step: 1n,
                                            maxLevel: 3n,
                                            parentMatchIdHash: generateMatchID(
                                                keccak256("0x6"),
                                                keccak256("0x7"),
                                            ),
                                            parentTournamentAddress:
                                                generateTournamentAddress(
                                                    7_204_918_919,
                                                    7_205_024_571,
                                                ),
                                            updatedAt: currentDate,
                                            height: 17n,
                                            level: 2n,
                                            matches: [],
                                            commitments: [
                                                {
                                                    blockNumber: 1n,
                                                    commitment:
                                                        keccak256("0x8"),
                                                    createdAt: currentDate,
                                                    epochIndex: 0n,
                                                    finalStateHash: zeroHash,
                                                    submitterAddress:
                                                        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                                                    tournamentAddress:
                                                        generateTournamentAddress(
                                                            7_204_918_919,
                                                            7_205_024_571,
                                                        ),
                                                    txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
                                                    updatedAt: currentDate,
                                                },
                                            ],
                                            winnerCommitment: keccak256("0x8"),
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
            {
                index: 4n,
                firstBlock: 0x457n,
                lastBlock: 0x5e1n,
                inputIndexLowerBound: 0xan,
                inputIndexUpperBound: 0xan,
                virtualIndex: 0x4n,
                machineHash:
                    "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                claimHash:
                    "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                claimTransactionHash: null,
                commitment: null,
                tournamentAddress: "0x3fd36d25c4515b8be331de689a5e65d2318ddea3",
                status: "CLAIM_COMPUTED",
                createdAt: currentDate,
                updatedAt: currentDate,
            },
            {
                index: 5n,
                firstBlock: 0x5e1n,
                lastBlock: 0x237dn,
                inputIndexLowerBound: 0xan,
                inputIndexUpperBound: 0xan,
                virtualIndex: 0x5n,
                machineHash: null,
                claimHash: null,
                claimTransactionHash: null,
                commitment: null,
                tournamentAddress: null,
                status: "OPEN",
                createdAt: currentDate,
                updatedAt: currentDate,
            },
        ],
    },
    {
        applicationAddress: "0x1590B6096A48A509286cdec2cb68E0DF292BFEf6",
        name: "comet",
        consensusType: "AUTHORITY",
        state: "ENABLED",
        processedInputs: 100n,
        consensusAddress: "0x44dc8f7bfa033e464cd672561aa62ad147f24012",
        inputBoxAddress,
        dataAvailability: {
            type: "InputBox",
            inputBoxAddress,
        },
        epochLength: 0n,
        executionParameters,
        inputBoxBlock: 0x3n,
        lastEpochCheckBlock: 0xa2en,
        lastInputCheckBlock: 0xa2en,
        lastOutputCheckBlock: 0xa2en,
        templateHash:
            "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
        reason: null,
        createdAt: currentDate,
        updatedAt: currentDate,
        epochs: [],
    },
    {
        applicationAddress: "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C",
        name: "disabled",
        consensusType: "QUORUM",
        state: "DISABLED",
        processedInputs: 15n,
        epochLength: 0n,
        executionParameters,
        consensusAddress: "0x44dc8f7bfa033e464cd672561aa62ad147f24012",
        dataAvailability: {
            type: "InputBox",
            inputBoxAddress,
        },
        inputBoxAddress,
        inputBoxBlock: 0x3n,
        lastEpochCheckBlock: 0xa2en,
        lastInputCheckBlock: 0xa2en,
        lastOutputCheckBlock: 0xa2en,
        templateHash:
            "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
        reason: null,
        createdAt: currentDate,
        updatedAt: currentDate,
        epochs: [],
    },
    {
        applicationAddress: "0x7285F04d1d779B77c63F61746C1dDa204E32aE45",
        name: "broken",
        consensusType: "PRT",
        state: "INOPERABLE",
        processedInputs: 45n,
        epochLength: 0n,
        executionParameters,
        consensusAddress: "0x44dc8f7bfa033e464cd672561aa62ad147f24012",
        dataAvailability: {
            type: "InputBox",
            inputBoxAddress,
        },
        inputBoxAddress,
        inputBoxBlock: 0x3n,
        lastEpochCheckBlock: 0xa2en,
        lastInputCheckBlock: 0xa2en,
        lastOutputCheckBlock: 0xa2en,
        templateHash:
            "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
        reason: null,
        createdAt: currentDate,
        updatedAt: currentDate,
        epochs: [
            {
                index: 0n,
                firstBlock: 1n,
                lastBlock: 0x2n,
                inputIndexLowerBound: 0x0n,
                inputIndexUpperBound: 0x11n,
                virtualIndex: 0x5n,
                machineHash: null,
                claimHash: null,
                claimTransactionHash: null,
                commitment: null,
                tournamentAddress: null,
                status: "OPEN",
                createdAt: currentDate,
                updatedAt: currentDate,
            },
        ],
    },
];
