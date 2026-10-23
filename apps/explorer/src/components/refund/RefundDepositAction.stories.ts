import type { Meta, StoryObj } from "@storybook/nextjs";
import { etherDepositInput, refundRpcHandler } from "../../stories/refunds";
import { RefundDepositAction } from "./RefundDepositAction";

const meta = {
    title: "Components/Refund/RefundDepositAction",
    component: RefundDepositAction,
    tags: ["autodocs"],
    parameters: { connectionType: "system" },
} satisfies Meta<typeof RefundDepositAction>;

export default meta;
type Story = StoryObj<typeof meta>;

const application = "0x40a7C73a6a592D8697bE97254E273E6f3FB46000";

/** An Ether deposit of an epoch that was open at foreclosure, not refunded yet. */
export const Refundable: Story = {
    parameters: { msw: { handlers: [refundRpcHandler()] } },
    args: {
        application,
        input: etherDepositInput,
        epochStatus: "CLAIM_FORECLOSED",
    },
};

/** The same deposit after someone issued its refund. */
export const Refunded: Story = {
    parameters: {
        msw: {
            handlers: [refundRpcHandler({ issued: [etherDepositInput.index] })],
        },
    },
    args: Refundable.args,
};
