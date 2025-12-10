import type { Meta, StoryObj } from "@storybook/nextjs";
import { applications } from "../stories/data";
import { ApplicationsPage } from "./ApplicationsPage";

const meta = {
    title: "Pages/Applications",
    component: ApplicationsPage,
    tags: ["autodocs"],
} satisfies Meta<typeof ApplicationsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        applications,
    },
};
