import type { ListReportsParams } from "@cartesi/viem";
import { useReports } from "@cartesi/wagmi";
import { Card, Center, Text } from "@mantine/core";
import { useState, type FC } from "react";
import type { DecoderType } from "../types";
import { ReportList } from "./ReportList";

interface ReportContainerProps extends ListReportsParams {
    decoderType?: DecoderType;
}

const NoReports = () => (
    <Center>
        <Text c="dimmed" size="xl">
            No reports generated
        </Text>
    </Center>
);

export const ReportContainer: FC<ReportContainerProps> = ({
    application,
    descending = true,
    epochIndex,
    inputIndex,
    limit,
    offset = 0,
    decoderType = "raw",
}) => {
    const [newOffset, setNewOffset] = useState<number>(offset);
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
        offset: newOffset,
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
        <ReportList
            decoderType={decoderType}
            reports={result.data}
            pagination={result.pagination}
            onPaginationChange={setNewOffset}
        />
    );
};
