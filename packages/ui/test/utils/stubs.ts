import { Application } from "../../src/commons/interfaces";

export const applications: Application[] = [
    {
        address: "0x60a7048c3136293071605a4eaffef49923e981cc",
        id: "11155111-0x60a7048c3136293071605a4eaffef49923e981cc-v1",
        rollupVersion: "v1",
    },
    {
        address: "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
        id: "11155111-0x70ac08179605af2d9e75782b8decdd3c22aa4d0c-v1",
        rollupVersion: "v1",
    },
    {
        address: "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
        id: "11155111-0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3-v1",
        rollupVersion: "v1",
    },
];

export const tokens = [
    "SIM20 - SimpleERC20 - 0x059c7507b973d1512768c06f32a813bc93d83eb2",
    "SIM20 - SimpleERC20 - 0x13bf42f9fed0d0d2708fbfdb18e80469d664fc14",
    "SIM20 - SimpleERC20 - 0xa46e0a31a1c248160acba9dd354c72e52c92c9f2",
];

export const erc721Contracts = [
    "0x7a3cc9c0408887a030a0354330c36a9cd681aa7e",
    "0x569dabb4f67770cc094d09fe4bf4202557d2f456",
    "0xaca048d528383ccf84d0edd511130e91eaf6d55c",
] as const;
