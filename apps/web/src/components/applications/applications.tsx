"use client";

import { Tabs } from "@mantine/core";
import { FC, useCallback, useState } from "react";
import { useAccount } from "wagmi";
import {
    useApplicationsConnectionOwnerQuery,
    useApplicationsConnectionQuery,
} from "../../graphql/explorer/hooks/queries";
import { ApplicationOrderByInput } from "../../graphql/explorer/types";
import getConfiguredChainId from "../../lib/getConfiguredChain";
import ApplicationsTable from "../applications/applicationsTable";
import Paginated from "../paginated";
import UserApplicationsTable from "./userApplicationsTable";

const UserApplications: FC = () => {
    const { address, isConnected } = useAccount();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();
    const chainId = getConfiguredChainId();
    const [query] = useApplicationsConnectionOwnerQuery({
        variables: {
            after,
            limit,
            orderBy: ApplicationOrderByInput.IdAsc,
            ownerId: address?.toLowerCase(),
            chainId,
        },
        pause: !isConnected,
    });
    const applications =
        !isConnected || !query.data
            ? []
            : query.data?.applicationsConnection.edges.map((edge) => edge.node);
    const totalCount =
        !isConnected || !query.data
            ? 0
            : query.data?.applicationsConnection.totalCount;

    const onChangePagination = useCallback((limit: number, page: number) => {
        setLimit(limit);
        setPage(page);
    }, []);

    return (
        <Paginated
            fetching={query.fetching}
            totalCount={totalCount}
            onChange={onChangePagination}
            data-testid="user-applications"
            py="sm"
        >
            <UserApplicationsTable
                applications={applications}
                fetching={query.fetching}
                totalCount={totalCount}
                noResultsMessage={
                    isConnected
                        ? undefined
                        : "Connect your wallet to list your Applications."
                }
            />
        </Paginated>
    );
};

const AllApplications: FC = () => {
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();
    const chainId = getConfiguredChainId();
    const [query] = useApplicationsConnectionQuery({
        variables: {
            orderBy: ApplicationOrderByInput.IdAsc,
            limit,
            after,
            chainId,
        },
    });
    const applications =
        query.data?.applicationsConnection.edges.map((edge) => edge.node) ?? [];

    const onChangePagination = useCallback((limit: number, page: number) => {
        setLimit(limit);
        setPage(page);
    }, []);

    return (
        <Paginated
            fetching={query.fetching}
            totalCount={query.data?.applicationsConnection.totalCount}
            onChange={onChangePagination}
            data-testid="all-applications"
            py="sm"
        >
            <ApplicationsTable
                applications={applications}
                fetching={query.fetching}
                totalCount={query.data?.applicationsConnection.totalCount ?? 0}
            />
        </Paginated>
    );
};

export const Applications = () => {
    return (
        <Tabs defaultValue="all-apps" keepMounted={false}>
            <Tabs.List>
                <Tabs.Tab value="all-apps">All Apps</Tabs.Tab>
                <Tabs.Tab value="my-apps">My Apps</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="all-apps">
                <AllApplications />
            </Tabs.Panel>

            <Tabs.Panel value="my-apps">
                <UserApplications />
            </Tabs.Panel>
        </Tabs>
    );
};
