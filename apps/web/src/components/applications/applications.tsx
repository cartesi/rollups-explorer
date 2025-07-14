"use client";

import { Flex, Tabs } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { FC, useCallback, useState } from "react";
import { useAccount } from "wagmi";
import {
    useApplicationsConnectionOwnerQuery,
    useApplicationsConnectionQuery,
} from "@cartesi/rollups-explorer-domain/explorer-hooks";
import { ApplicationOrderByInput } from "@cartesi/rollups-explorer-domain/explorer-types";
import getConfiguredChainId from "../../lib/getConfiguredChain";
import ApplicationsTable from "../applications/applicationsTable";
import Paginated from "../paginated";
import Search from "../search";
import UserApplicationsTable from "./userApplicationsTable";
import { useUrlSearchParams } from "../../hooks/useUrlSearchParams";
import { checkApplicationsQuery } from "../../lib/query";
import VersionsFilter from "../versionsFilter";
import { RollupVersion } from "@cartesi/rollups-explorer-domain/dist/graphql/explorer/types";

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
            orderBy: ApplicationOrderByInput.TimestampDesc,
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
    const [{ query: urlQuery }] = useUrlSearchParams();
    const [query, setQuery] = useState(urlQuery);
    const [queryDebounced] = useDebouncedValue(query, 500);
    const [versions, setVersions] = useState<string[]>([]);
    const [versionsDebounced] = useDebouncedValue(versions, 500);
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();
    const chainId = getConfiguredChainId();
    const [{ data: data, fetching: fetching }] = useApplicationsConnectionQuery(
        {
            variables: {
                orderBy: ApplicationOrderByInput.TimestampDesc,
                limit,
                after,
                where: checkApplicationsQuery({
                    chainId,
                    address: queryDebounced.toLowerCase(),
                    versions: versionsDebounced as RollupVersion[],
                }),
            },
        },
    );
    const applications =
        data?.applicationsConnection.edges.map((edge) => edge.node) ?? [];

    const onChangePagination = useCallback((limit: number, page: number) => {
        setLimit(limit);
        setPage(page);
    }, []);

    return (
        <Paginated
            fetching={fetching}
            totalCount={data?.applicationsConnection.totalCount}
            onChange={onChangePagination}
            data-testid="all-applications"
            py="sm"
            SearchInput={
                <Flex gap={8}>
                    <Search
                        placeholder="Search by Address / Owner"
                        flex={1}
                        isLoading={fetching}
                        onChange={setQuery}
                    />
                    <VersionsFilter
                        isLoading={fetching && versions.length > 0}
                        onChange={setVersions}
                    />
                </Flex>
            }
        >
            <ApplicationsTable
                applications={applications}
                fetching={fetching}
                totalCount={data?.applicationsConnection.totalCount ?? 0}
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
