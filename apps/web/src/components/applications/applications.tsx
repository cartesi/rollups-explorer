"use client";

import { Tabs } from "@mantine/core";
import { FC, useCallback, useEffect, useState } from "react";
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
    const { address } = useAccount();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();
    const [query] = useApplicationsConnectionOwnerQuery({
        variables: {
            after,
            limit,
            orderBy: ApplicationOrderByInput.IdAsc,
            ownerId: address?.toLowerCase(),
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
            data-testid="user-applications"
        >
            <UserApplicationsTable
                applications={applications}
                fetching={query.fetching}
                totalCount={query.data?.applicationsConnection.totalCount ?? 0}
            />
        </Paginated>
    );
};

const AllApplications: FC = () => {
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
        <Paginated
            fetching={query.fetching}
            totalCount={query.data?.applicationsConnection.totalCount}
            onChange={onChangePagination}
            data-testid="all-applications"
        >
            <ApplicationsTable
                applications={applications}
                fetching={query.fetching}
                totalCount={query.data?.applicationsConnection.totalCount ?? 0}
            />
        </Paginated>
    );
};

type ApplicationTab = "all-apps" | "my-apps";

export const Applications = () => {
    const { isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState<ApplicationTab>("all-apps");

    const onChangeTab = useCallback((tab: string | null) => {
        setActiveTab(tab as ApplicationTab);
    }, []);

    useEffect(() => {
        if (!isConnected) {
            setActiveTab("all-apps");
        }
    }, [isConnected]);

    return (
        <>
            {isConnected && (
                <Tabs value={activeTab} onChange={onChangeTab}>
                    <Tabs.List>
                        <Tabs.Tab value="all-apps">All Apps</Tabs.Tab>
                        <Tabs.Tab value="my-apps">My Apps</Tabs.Tab>
                    </Tabs.List>
                </Tabs>
            )}

            {activeTab === "all-apps" ? (
                <AllApplications />
            ) : (
                <UserApplications />
            )}
        </>
    );
};
