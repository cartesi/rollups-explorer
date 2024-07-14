"use client";
import { Badge, Loader } from "@mantine/core";
import React, { FC, useMemo } from "react";
import { useQuery } from "urql";
import {
    InputStatusDocument,
    InputStatusQuery,
    InputStatusQueryVariables,
} from "../../graphql/rollups/operations";

interface ConnectionInputStatusBadgeProps {
    graphqlUrl: string;
    index: number;
}

const ConnectionInputStatusBadge: FC<ConnectionInputStatusBadgeProps> = ({
    graphqlUrl,
    index,
}) => {
    const [result] = useQuery<InputStatusQuery, InputStatusQueryVariables>({
        context: useMemo(
            () => ({
                url: graphqlUrl,
            }),
            [graphqlUrl],
        ),
        query: InputStatusDocument,
        variables: {
            index,
        },
    });

    return (
        <>
            {result.fetching ? (
                <Loader
                    data-testid="connection-input-status-loader"
                    size="xs"
                />
            ) : result.data?.input.status ? (
                <Badge variant="default" style={{ textTransform: "none" }}>
                    {result.data.input.status}
                </Badge>
            ) : (
                "N/A"
            )}
        </>
    );
};

export default ConnectionInputStatusBadge;
