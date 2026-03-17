import type { Pagination as QPagination, Report } from "@cartesi/viem";
import { Stack } from "@mantine/core";
import { type FC } from "react";
import { QueryPagination } from "../QueryPagination";
import type { DecoderType } from "../types";
import { ReportView } from "./ReportView";

type ReportListProps = {
    reports: Report[];
    decoderType: DecoderType;
    pagination: QPagination;
    onPaginationChange?: (newOffset: number) => void;
};

export const ReportList: FC<ReportListProps> = ({
    pagination,
    onPaginationChange,
    reports,
    decoderType = "raw",
}) => {
    return (
        <Stack id="reports-list">
            <QueryPagination
                pagination={pagination}
                onPaginationChange={onPaginationChange}
            />
            {reports.map((report) => (
                <ReportView
                    key={`${report.inputIndex}-${report.index}`}
                    report={report}
                    displayAs={decoderType}
                />
            ))}
        </Stack>
    );
};
