import type { Withdrawal } from "@cartesi/viem";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { http } from "msw";
import {
    getMockResponse,
    STORIES_RPC_URL,
    type GenericJSONRPCRequest,
} from "../../stories/util";
import { WithdrawalList } from "./WithdrawalList";

const meta = {
    title: "Components/Withdrawal/WithdrawalList",
    component: WithdrawalList,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof WithdrawalList>;

export default meta;
type Story = StoryObj<typeof meta>;

const data: Withdrawal[] = [
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
];

export const Default: Story = {
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
    args: {
        withdrawals: data,
    },
};
