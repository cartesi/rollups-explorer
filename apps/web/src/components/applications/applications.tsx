"use client";

import {
    Group,
    Pagination,
    Select,
    Stack,
    Text,
    Title,
    useMantineColorScheme,
} from "@mantine/core";
import { FC, useCallback, useState } from "react";
import { useAccount } from "wagmi";
import {
    useApplicationsConnectionOwnerQuery,
    useApplicationsConnectionQuery,
} from "../../graphql/explorer/hooks/queries";
import { ApplicationOrderByInput } from "../../graphql/explorer/types";
import ApplicationsTable from "../applications/applicationsTable";
import Paginated, { perPageList } from "../paginated";
import UserApplicationsTable from "./userApplicationsTable";

type StackApplicationProps = {
    children?: React.ReactNode;
};

/**
 *
 * @returns Component to wrap Application or UserApplication coponent
 */

const StackApplication: FC<StackApplicationProps> = ({ children }) => {
    const { colorScheme } = useMantineColorScheme();
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
            {children}
        </Stack>
    );
};

const UserApplications: FC = () => {
    const { address, isConnected } = useAccount();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<number>(10);
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();
    const [query] = useApplicationsConnectionOwnerQuery({
        variables: {
            after,
            limit,
            orderBy: ApplicationOrderByInput.IdAsc,
            ownerId: "0xf05d57a5bed2d1b529c56001fc5810cc9afc0335".toLowerCase(),
        },
        pause: !isConnected,
    });
    const totalCount = query.data?.applicationsConnection.totalCount;
    const totalPages = Math.ceil(
        totalCount === undefined || totalCount === 0 ? 1 : totalCount / 10,
    );
    const applications =
        query.data?.applicationsConnection.edges.map((edge) => edge.node) ?? [];
    const activePage = page > totalPages ? totalPages : page;
    const changeLimit = useCallback((val: string | null) => {
        const parsed = val ? parseInt(val, 10) : null;
        if (typeof parsed === "number" && !isNaN(parsed)) {
            setLimit(parsed);
        }
    }, []);

    return (
        <>
            {isConnected && (
                <StackApplication>
                    <Title order={4}>My Applications</Title>
                    <Pagination
                        styles={{ root: { alignSelf: "flex-end" } }}
                        value={activePage}
                        total={totalPages}
                        onChange={setPage}
                    />
                    <UserApplicationsTable
                        applications={applications}
                        fetching={query.fetching}
                        totalCount={
                            query.data?.applicationsConnection.totalCount ?? 0
                        }
                    />
                    <Group justify="space-between" align="center">
                        <Group>
                            <Text>Show:</Text>
                            <Select
                                style={{ width: "5rem" }}
                                value={limit.toString()}
                                onChange={changeLimit}
                                data={perPageList}
                            />
                            <Text>items</Text>
                        </Group>

                        <Pagination
                            styles={{ root: { alignSelf: "flex-end" } }}
                            value={activePage}
                            total={totalPages}
                            onChange={setPage}
                        />
                    </Group>
                </StackApplication>
            )}
        </>
    );
};

const Applications: FC = () => {
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
        <StackApplication>
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
        </StackApplication>
    );
};

export { Applications, UserApplications };
