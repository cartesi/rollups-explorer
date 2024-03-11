"use client";

import { Stack, Title, useMantineColorScheme } from "@mantine/core";
import { FC, useCallback, useState } from "react";
import { useAccount } from "wagmi";
import {
    useApplicationsConnectionOwnerQuery,
    useApplicationsConnectionQuery,
} from "../../graphql/explorer/hooks/queries";
import { ApplicationOrderByInput } from "../../graphql/explorer/types";
import ApplicationsTable from "../applications/applicationsTable";
import Paginated from "../paginated";
import UserApplicationsTable from "./userApplicationsTable";

const UserApplications: FC = () => {
    const { colorScheme } = useMantineColorScheme();
    const { address, isConnected } = useAccount();
    const [query] = useApplicationsConnectionOwnerQuery({
        variables: {
            orderBy: ApplicationOrderByInput.IdAsc,
            limit: 20,
            after: "1",
            ownerId: address,
        },
    });
    const applications =
        query.data?.applicationsConnection.edges.map((edge) => edge.node) ?? [];

    return (
        <>
            {isConnected && (
                <Stack
                    py={"sm"}
                    style={{
                        borderTop: `calc(0.0625rem * var(--mantine-scale)) solid ${
                            colorScheme === "light"
                                ? "var(--mantine-color-gray-3)"
                                : "var(--mantine-color-dark-4)"
                        }`,
                    }}
                >
                    <>
                        <Title order={4}>My Applications</Title>
                        <UserApplicationsTable
                            applications={applications}
                            fetching={query.fetching}
                            totalCount={
                                query.data?.applicationsConnection.totalCount ??
                                0
                            }
                        />
                    </>
                </Stack>
            )}
        </>
    );
};

const Applications: FC = () => {
    const { colorScheme } = useMantineColorScheme();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();
    const [query] = useApplicationsConnectionQuery({
        variables: { orderBy: ApplicationOrderByInput.IdAsc, limit, after },
    });
    const applications =
        query.data?.applicationsConnection.edges.map((edge) => edge.node) ?? [];

    const onChangePagination = useCallback((limit: number, page: number) => {
        setLimit(limit);
        setPage(page);
    }, []);

    return (
        <Stack
            py={"sm"}
            style={{
                borderTop: `calc(0.0625rem * var(--mantine-scale)) solid ${
                    colorScheme === "light"
                        ? "var(--mantine-color-gray-3)"
                        : "var(--mantine-color-dark-4)"
                }`,
            }}
        >
            <Title order={4}>All Applications</Title>
            <Paginated
                fetching={query.fetching}
                totalCount={query.data?.applicationsConnection.totalCount}
                onChange={onChangePagination}
            >
                <ApplicationsTable
                    applications={applications}
                    fetching={query.fetching}
                    totalCount={
                        query.data?.applicationsConnection.totalCount ?? 0
                    }
                />
            </Paginated>
        </Stack>
    );
};

export { Applications, UserApplications };
