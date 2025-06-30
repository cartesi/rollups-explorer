"use client";

import { useDebouncedValue } from "@mantine/hooks";
import { FC, useCallback, useMemo, useState } from "react";
import { useInputsConnectionQuery } from "@cartesi/rollups-explorer-domain/explorer-hooks";
import {
    InputOrderByInput,
    RollupVersion,
} from "@cartesi/rollups-explorer-domain/explorer-types";
import { useUrlSearchParams } from "../../hooks/useUrlSearchParams";
import getConfiguredChainId from "../../lib/getConfiguredChain";
import { checkQuery } from "../../lib/query";
import InputsTable from "../inputs/inputsTable";
import Paginated from "../paginated";
import Search from "../search";
import { Flex } from "@mantine/core";
import { VersionsFilter } from "../versionsFilter";

export type InputsProps = {
    orderBy?: InputOrderByInput;
    appVersion?: RollupVersion;
    appAddress?: string;
};

const Inputs: FC<InputsProps> = ({
    orderBy = InputOrderByInput.TimestampDesc,
    appAddress,
    appVersion,
}) => {
    const chainId = getConfiguredChainId();
    const [{ query: urlQuery }] = useUrlSearchParams();
    const [query, setQuery] = useState(urlQuery);
    const [queryDebounced] = useDebouncedValue(query, 500);
    const [versions, setVersions] = useState<string[]>([]);
    const [versionsDebounced] = useDebouncedValue(versions, 500);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();

    const [{ data: data, fetching: fetching }] = useInputsConnectionQuery({
        variables: {
            orderBy,
            limit,
            after,
            where: checkQuery(
                queryDebounced.toLowerCase(),
                appAddress?.toLowerCase(),
                chainId,
                appVersion
                    ? [appVersion]
                    : (versionsDebounced as RollupVersion[]),
            ),
        },
    });
    const totalCount = data?.inputsConnection.totalCount ?? 0;

    const inputs = useMemo(
        () => data?.inputsConnection.edges.map((edge) => edge.node) ?? [],
        [data?.inputsConnection.edges],
    );

    const onChangePagination = useCallback((limit: number, page: number) => {
        setLimit(limit);
        setPage(page);
    }, []);

    /**
     * @description Memoized paginated table component
     * The memoization is required so that the component doesn't re-render
     * whenever the search input value changes
     */
    return useMemo(
        () => (
            <Paginated
                fetching={fetching}
                totalCount={totalCount}
                onChange={onChangePagination}
                SearchInput={
                    <Flex gap={8}>
                        <Search
                            flex={1}
                            isLoading={fetching}
                            onChange={setQuery}
                        />
                        {!appVersion && (
                            <VersionsFilter onChange={setVersions} />
                        )}
                    </Flex>
                }
            >
                <InputsTable
                    inputs={inputs}
                    fetching={fetching}
                    totalCount={totalCount}
                />
            </Paginated>
        ),
        [fetching, totalCount, onChangePagination, appVersion, inputs],
    );
};

export default Inputs;
