import React from "react";
import { useApplicationsQuery } from "../graphql";

export const useSearchApplications = ({
    address,
    limit,
}: {
    address?: string;
    limit?: number;
}) => {
    const [{ data: applicationData, fetching }] = useApplicationsQuery({
        variables: {
            limit: limit ?? 10,
            where: {
                id_containsInsensitive: address ?? "",
            },
        },
    });
    const applications = React.useMemo(
        () => (applicationData?.applications ?? []).map((a) => a.id),
        [applicationData],
    );
    return { applications, fetching };
};
