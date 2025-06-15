"use client";
import { Badge, Loader } from "@mantine/core";
import { FC, useMemo } from "react";
import { useQuery } from "urql";
import { RollupVersion } from "@cartesi/rollups-explorer-domain/explorer-types";
import {
    InputStatusDocument,
    InputStatusQuery,
    InputStatusQueryVariables,
} from "@cartesi/rollups-explorer-domain/rollups-operations";
import {
    InputStatusDocument as V2StatusDocument,
    InputStatusQuery as V2StatusQuery,
    InputStatusQueryVariables as V2StatusQueryVariables,
} from "@cartesi/rollups-explorer-domain/rollups-v2-operations";

interface ConnectionInputStatusBadgeProps {
    graphqlUrl: string;
    index: number;
    application: {
        rollupVersion: RollupVersion;
        id: string;
        address: string;
    };
}

const ConnectionInputStatusBadge: FC<ConnectionInputStatusBadgeProps> = ({
    graphqlUrl,
    index,
    application,
}) => {
    const context = useMemo(
        () => ({
            url: graphqlUrl,
        }),
        [graphqlUrl],
    );

    const [result] = useQuery<InputStatusQuery, InputStatusQueryVariables>({
        context: context,
        query: InputStatusDocument,
        variables: {
            index,
        },
        pause: application.rollupVersion !== RollupVersion.V1,
    });

    const [resultV2] = useQuery<V2StatusQuery, V2StatusQueryVariables>({
        context: context,
        query: V2StatusDocument,
        variables: {
            id: index.toString(),
        },
        pause: application.rollupVersion !== RollupVersion.V2,
    });

    const fetching =
        application.rollupVersion === RollupVersion.V1
            ? result.fetching
            : resultV2.fetching;
    const data =
        application.rollupVersion === RollupVersion.V1
            ? result.data
            : resultV2.data;

    return (
        <>
            {fetching ? (
                <Loader
                    data-testid="connection-input-status-loader"
                    size="xs"
                />
            ) : data?.input.status ? (
                <Badge variant="default" style={{ textTransform: "none" }}>
                    {data.input.status}
                </Badge>
            ) : (
                "N/A"
            )}
        </>
    );
};

export default ConnectionInputStatusBadge;
