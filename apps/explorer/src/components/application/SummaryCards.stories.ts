import type { Meta, StoryObj } from "@storybook/nextjs";
import {
    TbClock,
    TbCoins,
    TbInbox,
    TbMail,
    TbMessageReport,
    TbReceiptRefund,
    TbTransferOut,
    TbTrophy,
} from "react-icons/tb";
import { SummaryCards } from "./SummaryCards";

const meta = {
    title: "Components/Application/SummaryCards",
    component: SummaryCards,
    tags: ["autodocs"],
} satisfies Meta<typeof SummaryCards>;

export default meta;
type Story = StoryObj<typeof meta>;

const displaySkeleton = false;
const prtCards = [
    { title: "Epochs", value: 53, icon: TbClock, displaySkeleton },
    { title: "Inputs", value: 4, icon: TbInbox, displaySkeleton },
    { title: "Outputs", value: 2, icon: TbMail, displaySkeleton, href: "#" },
    { title: "Reports", value: 0, icon: TbMessageReport, displaySkeleton },
    { title: "Withdrawals", value: 2, icon: TbTransferOut, displaySkeleton },
    { title: "Refunds", value: 1, icon: TbReceiptRefund, displaySkeleton },
    { title: "Tournaments", value: 52, icon: TbTrophy, displaySkeleton },
    {
        title: "Bond events",
        value: 96,
        icon: TbCoins,
        displaySkeleton,
        href: "#",
    },
];

/** Foreclosed PRT application: eight counters, three per row on desktop. */
export const PrtCollapsed: Story = {
    args: { cards: prtCards, perRow: { base: 1, xs: 2, sm: 3 } },
};

/** The same counters with the extra rows expanded. */
export const PrtExpanded: Story = {
    args: { ...PrtCollapsed.args, defaultOpened: true },
};

/** Authority application that is not foreclosed: four counters, two per row, so the second row collapses as well. */
export const AuthorityCollapsed: Story = {
    args: { cards: prtCards.slice(0, 4), perRow: { base: 1, xs: 2, sm: 2 } },
};

/** Phone width: one card per row, so the top two stay visible and the rest collapses. */
export const PrtMobile: Story = {
    args: PrtCollapsed.args,
    globals: { viewport: { value: "mobile1" } },
};
