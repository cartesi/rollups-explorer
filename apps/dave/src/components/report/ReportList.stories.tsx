import type { GetReportReturnType } from "@cartesi/viem";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { stringToHex } from "viem";
import { ReportList } from "./ReportList";

const meta = {
    title: "Components/Report/ReportList",
    component: ReportList,
    tags: ["autodocs"],
} satisfies Meta<typeof ReportList>;

export default meta;
type Story = StoryObj<typeof meta>;

type Props = Parameters<typeof ReportList>[0];

const date = new Date();

const validReport: GetReportReturnType = {
    inputIndex: 0n,
    index: 0n,
    rawData: "0x556e737570706f7274656420616374696f6e20617474656d707465642e",
    createdAt: date,
    updatedAt: date,
};

const validReport2: GetReportReturnType = {
    ...validReport,
    index: 1n,
    rawData: stringToHex("Operation not supported."),
};

const validReport3: GetReportReturnType = {
    ...validReport,
    index: 2n,
    rawData: stringToHex("Application is not accepting inputs at the moment"),
};

const validReport4: GetReportReturnType = {
    ...validReport,
    index: 3n,
    rawData: stringToHex("Something wrong is not right."),
};

const Wrapper = (props: Props) => {
    const [index, setIndex] = useState<number>(props.pagination.offset);
    const outputs = props.reports.slice(index, props.pagination.limit + index);

    return (
        <ReportList
            {...props}
            reports={outputs}
            pagination={{ ...props.pagination, offset: index }}
            onPaginationChange={setIndex}
        />
    );
};

export const SingleReportPerPage: Story = {
    args: {
        reports: [
            validReport,
            {
                ...validReport,
                index: 1n,
                rawData: stringToHex("The operation is not supported yet."),
            },
        ],
        pagination: {
            limit: 1,
            totalCount: 2,
            offset: 0,
        },
        decoderType: "text",
    },
    render: Wrapper,
};

export const MultipleReportsPerPage: Story = {
    args: {
        reports: [validReport, validReport2, validReport3, validReport4],
        pagination: {
            limit: 3,
            totalCount: 4,
            offset: 0,
        },
        decoderType: "text",
    },
    render: Wrapper,
};
