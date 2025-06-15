"use client";

import { Grid } from "@mantine/core";
import React, { FC, useMemo } from "react";
import { SummaryCard } from "@cartesi/rollups-explorer-ui";
import { TbAlertTriangle, TbReportAnalytics, TbTicket } from "react-icons/tb";
import { useQuery } from "urql";
import {
    CheckStatusDocument,
    CheckStatusQuery,
    CheckStatusQueryVariables,
} from "@cartesi/rollups-explorer-domain/rollups-operations";

export interface ConnectionSummaryProps {
    url: string;
}

export const ConnectionSummary: FC<ConnectionSummaryProps> = ({ url }) => {
    const [result] = useQuery<CheckStatusQuery, CheckStatusQueryVariables>({
        query: CheckStatusDocument,
        context: useMemo(
            () => ({
                url,
                requestPolicy: "network-only",
            }),
            [url],
        ),
    });

    return (
        <>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }} mb="sm">
                <SummaryCard
                    title="Notices"
                    value={result.data?.notices.totalCount ?? 0}
                    icon={TbAlertTriangle}
                />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }} mb="sm">
                <SummaryCard
                    title="Vouchers"
                    value={result.data?.vouchers.totalCount ?? 0}
                    icon={TbTicket}
                />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }} mb="sm">
                <SummaryCard
                    title="Reports"
                    value={result.data?.reports.totalCount ?? 0}
                    icon={TbReportAnalytics}
                />
            </Grid.Col>
        </>
    );
};

export default ConnectionSummary;
