import type { Meta, StoryObj } from "@storybook/nextjs";
import { ForeclosedApplicationDriveProved } from "../../page/ApplicationSummaryPage.stories";
import { refundableDeposits } from "../../stories/refunds";
import { RefundableDeposits } from "./RefundableDeposits";

const meta = {
    title: "Components/Refund/RefundableDeposits",
    component: RefundableDeposits,
    tags: ["autodocs"],
} satisfies Meta<typeof RefundableDeposits>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Deposits of the epoch that was open at foreclosure: two still refundable, one already refunded. */
export const Deposits: Story = {
    args: {
        application: ForeclosedApplicationDriveProved.args.application,
        deposits: refundableDeposits,
    },
};
