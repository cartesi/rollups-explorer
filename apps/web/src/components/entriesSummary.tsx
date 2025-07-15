"use client";

import {
    useStatsApplicationsOwnerQuery,
    useStatsQuery,
} from "@cartesi/rollups-explorer-domain/explorer-hooks";
import { Summary } from "@cartesi/rollups-explorer-ui";
import { FC } from "react";
import { useAccount } from "wagmi";

import { useAppConfig } from "../providers/appConfigProvider";

const EntriesSummary: FC = () => {
    const { chainId } = useAppConfig();
    const { address, isConnected } = useAccount();
    const [{ data: stats }] = useStatsQuery({
        variables: {
            chainId,
        },
    });
    const [{ data: applicationsOwned }] = useStatsApplicationsOwnerQuery({
        variables: {
            ownerAddress: address?.toLowerCase(),
            chainId,
        },
        pause: !isConnected,
    });
    const applicationsOwnedCount = isConnected
        ? (applicationsOwned?.applicationsConnection?.totalCount ?? 0)
        : 0;

    return (
        <Summary
            inputs={stats?.inputsConnection?.totalCount ?? 0}
            applications={stats?.applicationsConnection?.totalCount ?? 0}
            applicationsOwned={applicationsOwnedCount}
            data-testid="entries-summary"
        />
    );
};

export default EntriesSummary;
