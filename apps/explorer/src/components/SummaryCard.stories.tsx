import type { Meta, StoryObj } from "@storybook/nextjs";
import { TbMail } from "react-icons/tb";
import { pathBuilder } from "../routes/routePathBuilder";
import { SummaryCard } from "./SummaryCard";

const meta = {
    title: "Components/General/SummaryCard",
    component: SummaryCard,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof SummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: "Total Outputs",
        value: 10,
        displaySkeleton: false,
        icon: TbMail,
    },
};

export const Loading: Story = {
    parameters: {
        layout: "padded",
    },
    args: {
        displaySkeleton: true,
        title: "Total Outputs",
        value: 0,
        icon: TbMail,
    },
};

export const WithLink: Story = {
    args: {
        title: "Total Outputs",
        value: 10,
        displaySkeleton: false,
        icon: TbMail,
        href: pathBuilder.outputs({
            application: "0x1234567890abcdef",
        }),
    },
};

export const BigNumber: Story = {
    args: {
        title: "Total Outputs",
        value: 123456789,
        displaySkeleton: false,
        icon: TbMail,
    },
};
