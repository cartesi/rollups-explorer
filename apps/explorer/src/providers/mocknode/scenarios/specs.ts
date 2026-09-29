import { getAddress } from "viem";
import {
    accounts,
    addressOf,
    type ClaimSpec,
    type MatchSpec,
    type PrtScenarioSpec,
    type TournamentSpec,
} from "./timeline";

const honest: ClaimSpec = { account: accounts.node, honest: true };
const adversary: ClaimSpec = { account: accounts.adversary };
const sybil = (index: number): ClaimSpec => ({
    account: addressOf("sybil", index),
});

const sides = (first: "ONE" | "TWO" = "ONE"): ClaimSpec[] =>
    first === "ONE"
        ? [{ side: "ONE" }, { side: "TWO" }]
        : [{ side: "TWO" }, { side: "ONE" }];

const child = (inner: TournamentSpec): MatchSpec => ({
    end: "CHILD_TOURNAMENT",
    inner,
});

/**
 * A dispute bisected down to the leaf tournament, from a root match where the
 * honest claim is commitment one, with the honest claim on the given side of
 * the leaf match.
 */
const downToLeaf = (leaf: MatchSpec, honestSide: "ONE" | "TWO" = "ONE") =>
    child({
        claims: sides(),
        matches: [
            child({
                claims: sides(honestSide),
                matches: [leaf],
            }),
        ],
    });

const PARALLEL_FINAL: MatchSpec = {
    end: "TIMEOUT",
    winner: "ONE",
    advances: 1,
};

const scenario = (
    spec: Omit<PrtScenarioSpec, "address"> & { address?: string },
): PrtScenarioSpec => ({
    ...spec,
    address: spec.address
        ? getAddress(spec.address)
        : addressOf(spec.name, "application"),
});

export const prtScenarios: PrtScenarioSpec[] = [
    scenario({
        name: "AppOne",
        address: "0xFc0E04b72f5630b277a07cD50c7F88Ca2331EB65",
        inputs: 1,
        root: { claims: [], matches: [] },
    }),
    scenario({
        name: "AppTwo",
        address: "0x245216ec64bef3a84d040cc9aba864763434f29d",
        inputs: 1,
        root: { claims: [honest], matches: [], recovered: true },
        presentAt: 60,
    }),
    scenario({
        name: "AppThree",
        address: "0xfedcc6bfc1a7077b61fa59e91bb7f5ad67851945",
        inputs: 1,
        root: { claims: [honest], matches: [] },
    }),
    scenario({
        name: "AppFour",
        address: "0x8703056f8a57efb779875d5f9c172b4594fcd329",
        inputs: 1,
        root: {
            claims: [{ ...honest, relayed: true }],
            matches: [],
            recovered: true,
        },
    }),
    scenario({
        name: "AppFive",
        address: "0x27c2cb273d92f9c318696124018fc7adb8873122",
        inputs: 3,
        root: {
            claims: [honest, adversary],
            matches: [{ end: "TIMEOUT", winner: "ONE", advances: 1 }],
            recovered: true,
        },
    }),
    scenario({
        name: "AppSix",
        address: "0xd89231a464d15f3c84232e9100d26eb0fbd94f5b",
        inputs: 3,
        root: {
            claims: [honest, adversary],
            matches: [{ end: "ELIMINATED", advances: 0 }],
        },
    }),
    scenario({
        name: "AppSeven",
        address: "0xc0603264a9d8f18c67c534ab9f0a71c41fead1d7",
        inputs: 3,
        root: {
            claims: [honest, adversary],
            matches: [
                child({
                    claims: sides(),
                    matches: [{ end: "ELIMINATED", advances: 0 }],
                }),
            ],
        },
    }),
    scenario({
        name: "AppEight",
        address: "0xf1fcb0ddfa71f5df396c67087406baa2cb97f382",
        inputs: 3,
        root: {
            claims: [honest, adversary],
            matches: [
                child({
                    claims: sides(),
                    matches: [{ end: "TIMEOUT", winner: "ONE", advances: 1 }],
                }),
            ],
        },
    }),
    scenario({
        name: "AppNine",
        address: "0xd2a9b49cad4cbaa04421e8731fdb917832bee281",
        inputs: 3,
        root: {
            claims: [honest, { ...adversary, relayed: true }],
            matches: [downToLeaf({ end: "STEP", winner: "TWO" }, "TWO")],
            recovered: true,
        },
        presentAt: 110,
    }),
    scenario({
        name: "AppTen",
        address: "0x857856ae0cf7da2ad7161dba89f7124bba407d0a",
        inputs: 3,
        root: {
            claims: [honest, adversary],
            matches: [
                child({
                    claims: sides(),
                    matches: [child({ claims: [], matches: [] })],
                }),
            ],
        },
    }),
    scenario({
        name: "AppEleven",
        address: "0x7285f04d1d779b77c63f61746c1dda204e32ae45",
        inputs: 3,
        root: {
            claims: [honest, adversary],
            matches: [downToLeaf({ end: "STEP", winner: "TWO" }, "TWO")],
            recovered: true,
        },
    }),
    scenario({
        name: "AppTwelve",
        address: "0x8ef10006acdd80ea6a2d6ac103707b7700900f99",
        inputs: 3,
        root: {
            claims: [honest, adversary],
            matches: [
                downToLeaf(
                    { end: "TIMEOUT", winner: "TWO", advances: 10 },
                    "TWO",
                ),
            ],
        },
    }),
    scenario({
        name: "AppThirteen",
        address: "0x64a7f6c645e71c6a27343fa105cc0d480d2d9c64",
        inputs: 3,
        root: {
            claims: [honest, adversary],
            matches: [downToLeaf({ end: "ELIMINATED", advances: 2 }, "TWO")],
        },
    }),
    scenario({
        name: "AppFourteen",
        address: "0xe2a41abcd1bca20026e026c26088a799f6a912fa",
        inputs: 3,
        root: {
            claims: [
                honest,
                adversary,
                { ...adversary, relayed: true, rejectsRefunds: true },
            ],
            matches: [
                downToLeaf({ end: "STEP", winner: "TWO" }, "TWO"),
                child({
                    claims: sides(),
                    matches: [
                        child({
                            claims: sides(),
                            matches: [{ end: "STEP", winner: "TWO" }],
                        }),
                    ],
                }),
            ],
            recovered: true,
        },
    }),
    scenario({
        name: "AppFifteen",
        address: "0x8339bf73edd53135107a05ada4c640027bd8c20a",
        inputs: 3,
        root: {
            claims: [
                honest,
                adversary,
                ...Array.from({ length: 8 }, (_, index) => sybil(index)),
            ],
            matches: [
                { end: "TIMEOUT", winner: "ONE", advances: 45 },
                ...Array.from(
                    { length: 4 },
                    (): MatchSpec => ({ end: "ELIMINATED", advances: 0 }),
                ),
            ],
        },
    }),
    scenario({
        name: "ParallelDisputes",
        inputs: 3,
        root: {
            claims: [honest, adversary, sybil(0), sybil(1)],
            matches: [
                downToLeaf({ end: "STEP", winner: "TWO" }, "TWO"),
                downToLeaf({ end: "STEP", winner: "ONE" }),
                PARALLEL_FINAL,
            ],
            recovered: true,
        },
        presentAt: 60,
    }),
    scenario({
        name: "LeafRaceTimeout",
        inputs: 3,
        root: {
            claims: [honest, adversary],
            matches: [
                downToLeaf(
                    { end: "LEAF_TIMEOUT", winner: "TWO", slow: "ONE" },
                    "TWO",
                ),
            ],
            recovered: true,
        },
    }),
    scenario({
        name: "ExpiredInnerWinner",
        inputs: 3,
        root: {
            claims: [honest, adversary],
            matches: [
                {
                    end: "CHILD_TOURNAMENT",
                    unused: true,
                    inner: {
                        claims: sides(),
                        matches: [
                            { end: "TIMEOUT", winner: "ONE", advances: 3 },
                        ],
                    },
                },
            ],
        },
    }),
    scenario({
        name: "LateJoiner",
        inputs: 2,
        root: {
            claims: [honest, { ...adversary, joinAt: 240 }],
            matches: [
                { end: "TIMEOUT", winner: "ONE", advances: 3, slow: "TWO" },
            ],
            recovered: true,
        },
    }),
    scenario({
        name: "DivergedNode",
        inputs: 2,
        root: {
            claims: [honest, adversary],
            matches: [{ end: "TIMEOUT", winner: "TWO", advances: 0 }],
            recovered: true,
        },
    }),
];
