import React from "react";
import { useApplicationsQuery } from "@cartesi/rollups-explorer-domain/explorer-hooks";
import { RollupVersion } from "@cartesi/rollups-explorer-domain/explorer-types";

export const useSearchApplications = ({
    chainId,
    address,
    limit,
    rollupVersion,
}: {
    chainId: string;
    address?: string;
    limit?: number;
    rollupVersion?: RollupVersion;
}) => {
    const rollupVersionFilter = rollupVersion
        ? { rollupVersion_eq: rollupVersion }
        : {};

    const [{ data: applicationData, fetching }] = useApplicationsQuery({
        variables: {
            limit: limit ?? 10,
            where: {
                address_containsInsensitive: address ?? "",
                chain: {
                    id_eq: chainId,
                },
                ...rollupVersionFilter,
            },
        },
    });

    const applications = React.useMemo(
        () => applicationData?.applications ?? [],
        [applicationData],
    );

    return { applications, fetching };
};
