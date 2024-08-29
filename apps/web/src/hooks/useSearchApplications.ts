import React from "react";
import { useApplicationsQuery } from "../graphql/explorer/hooks/queries";

export const useSearchApplications = ({
    chainId,
    address,
    limit,
}: {
    chainId: string;
    address?: string;
    limit?: number;
}) => {
    const [{ data: applicationData, fetching }] = useApplicationsQuery({
        variables: {
            limit: limit ?? 10,
            where: {
                address_containsInsensitive: address ?? "",
                chain: {
                    id_eq: chainId,
                },
            },
        },
    });
    const applications = React.useMemo(
        () => (applicationData?.applications ?? []).map((a) => a.address),
        [applicationData],
    );
    return { applications, fetching };
};
