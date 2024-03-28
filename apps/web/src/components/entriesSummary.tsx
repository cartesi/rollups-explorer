"use client";

import { Summary } from "@cartesi/rollups-explorer-ui";
import { FC } from "react";
import { useStatsQuery } from "../graphql/explorer/hooks/queries";

const EntriesSummary: FC = () => {
    const [{ data: stats }] = useStatsQuery();

    return (
        <Summary
            inputs={stats?.inputsConnection?.totalCount ?? 0}
            applications={stats?.applicationsConnection?.totalCount ?? 0}
        />
    );
};

export default EntriesSummary;
