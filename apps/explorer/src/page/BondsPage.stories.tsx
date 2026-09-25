import type { Meta, StoryObj } from "@storybook/nextjs";
import * as BondLedgerStories from "../components/bond/BondLedger.stories";
import { getBondAccounts, getBondTotals } from "../lib/bondUtils";
import { applications } from "../stories/data";
import { BondsPage } from "./BondsPage";

const meta = {
    title: "Pages/Bonds",
    component: BondsPage,
    tags: ["autodocs"],
} satisfies Meta<typeof BondsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const events = BondLedgerStories.Recovered.args.events;
const page = events.slice(0, 10);

export const AllEpochs: Story = {
    args: {
        application: applications[0].name,
        events: page,
        isLoading: false,
        limit: 10,
        pagination: { limit: 10, offset: 0, totalCount: events.length },
    },
};

export const EpochSelected: Story = {
    args: {
        ...AllEpochs.args,
        epochIndex: 3n,
        summary: {
            accounts: getBondAccounts(events),
            totals: getBondTotals(events),
        },
    },
};

export const MultiplePages: Story = {
    args: {
        ...EpochSelected.args,
        events: events.slice(10),
        pagination: { limit: 10, offset: 10, totalCount: events.length },
    },
};

export const SummaryLoading: Story = {
    args: {
        ...EpochSelected.args,
        summary: undefined,
        isSummaryLoading: true,
    },
};

export const Empty: Story = {
    args: {
        ...AllEpochs.args,
        events: [],
        pagination: { limit: 10, offset: 0, totalCount: 0 },
    },
};

export const Loading: Story = {
    args: {
        ...AllEpochs.args,
        events: [],
        isLoading: true,
    },
};
