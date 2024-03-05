"use client";

import { Summary } from "@cartesi/rollups-explorer-ui";
import { FC } from "react";
import { useAccount } from "wagmi";
import {
    useStatsApplicationsOwnerQuery,
    useStatsQuery,
} from "../graphql/explorer/hooks/queries";
const EntriesSummary: FC = () => {
    const { address } = useAccount();
    const [{ data: stats }] = useStatsQuery();
    const [{ data: applicationsOwned }] = useStatsApplicationsOwnerQuery({
        variables: {
            applicationId: address,
        },
    });

    return (
        <Summary
            inputs={stats?.inputsConnection?.totalCount ?? 0}
            applications={stats?.applicationsConnection?.totalCount ?? 0}
            applicationsOwned={
                applicationsOwned?.applicationsConnection?.totalCount ?? 0
            }
        />
    );
};

export default EntriesSummary;
