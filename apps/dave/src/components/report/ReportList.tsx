import type { ListReportsParams } from "@cartesi/viem";
import { useReports } from "@cartesi/wagmi";
import { Card, Center, Stack, Text } from "@mantine/core";
import { type FC } from "react";
import type { DecoderType } from "../types";
import { Report } from "./Report";

interface ReportListProps extends ListReportsParams {
    decoderType?: DecoderType;
}

const NoReports = () => (
    <Center>
        <Text c="dimmed" size="xl">
            No reports generated
        </Text>
    </Center>
);

export const ReportList: FC<ReportListProps> = ({
    application,
    descending = true,
    epochIndex,
    inputIndex,
    limit,
    offset,
    decoderType = "raw",
}) => {
    const {
        data: result,
        isLoading,
        error,
        isError,
    } = useReports({
        application,
        epochIndex,
        inputIndex,
        descending,
        limit,
        offset,
    });

    if (isLoading) {
        return (
            <Card>
                <Center>
                    <Text c="dimmed">Checking for reports...</Text>
                </Center>
            </Card>
        );
    }

    if (isError) {
        console.error(error.message);
        return (
            <Card>
                <Center>
                    <Text c="red">Could not fetch the reports</Text>
                </Center>
            </Card>
        );
    }

    if (!result || result.data.length === 0) {
        return <NoReports />;
    }

    return (
        <Stack id="reports-list">
            {result.data.map((report) => (
                <Report
                    key={`${report.inputIndex}-${report.index}`}
                    report={report}
                    displayAs={decoderType}
                />
            ))}
        </Stack>
    );
};
