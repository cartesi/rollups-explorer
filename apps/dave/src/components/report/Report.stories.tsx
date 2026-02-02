import type { GetReportReturnType } from "@cartesi/viem";
import { SegmentedControl, Stack } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { type DecoderType } from "../types";
import { Report } from "./Report";

const meta = {
    title: "Components/Report",
    component: Report,
    tags: ["autodocs"],
} satisfies Meta<typeof Report>;

export default meta;
type Story = StoryObj<typeof meta>;

const validReport: GetReportReturnType = {
    createdAt: new Date(),
    updatedAt: new Date(),
    index: 1n,
    inputIndex: 1n,
    rawData:
        "0x7b22616374696f6e223a2265726332305f6465706f736974222c2264617461223a7b226d7367223a22576974686472617720766f7563686572206f662033353030204552432d323020746f203078613037343638334235424530313546303533623544636562303634433431664339443131423645352067656e6572617465642e227d7d",
};

type Props = Parameters<typeof Report>[0];

const WithDecoding = (props: Props) => {
    const options = [
        { label: "Raw", value: "raw" },
        { label: "as Text", value: "text" },
        { label: "as JSON", value: "json" },
    ];
    const [displayOpt, setDisplayOpt] = useState<DecoderType>("raw");

    return (
        <Stack gap="lg">
            <SegmentedControl
                value={displayOpt}
                data={options}
                onChange={(value) => setDisplayOpt(value as DecoderType)}
            />
            <Report report={props.report} displayAs={displayOpt} />
        </Stack>
    );
};

export const Default: Story = {
    args: {
        displayAs: "raw",
        report: validReport,
    },
    render: WithDecoding,
};
