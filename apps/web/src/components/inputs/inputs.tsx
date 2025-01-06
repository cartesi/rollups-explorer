"use client";

import { Stack } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { FC, useCallback, useState } from "react";
import { useInputsConnectionQuery } from "../../graphql/explorer/hooks/queries";
import { InputOrderByInput } from "../../graphql/explorer/types";
import getConfiguredChainId from "../../lib/getConfiguredChain";
import { checkQuery } from "../../lib/query";
import InputsTable from "../inputs/inputsTable";
import Paginated from "../paginated";
import Search from "../search";
import { useUrlSearchParams } from "../../hooks/useUrlSearchParams";

export type InputsProps = {
    orderBy?: InputOrderByInput;
    applicationId?: string;
};

const Inputs: FC<InputsProps> = ({
    orderBy = InputOrderByInput.TimestampDesc,
    applicationId,
}) => {
    const chainId = getConfiguredChainId();
    const [{ query: urlQuery }] = useUrlSearchParams();
    const [query, setQuery] = useState(urlQuery);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();

    const [queryDebounced] = useDebouncedValue(query, 500);

    const [{ data: data, fetching: fetching }] = useInputsConnectionQuery({
        variables: {
            orderBy,
            limit,
            after,
            where: checkQuery(
                queryDebounced.toLowerCase(),
                applicationId?.toLowerCase(),
                chainId,
            ),
        },
    });
    const inputs = data?.inputsConnection.edges.map((edge) => edge.node) ?? [];

    const onChangePagination = useCallback((limit: number, page: number) => {
        setLimit(limit);
        setPage(page);
    }, []);

    return (
        <Stack>
            <Search isLoading={fetching} onChange={setQuery} />
            <Paginated
                fetching={fetching}
                totalCount={data?.inputsConnection.totalCount}
                onChange={onChangePagination}
            >
                <InputsTable
                    inputs={inputs}
                    fetching={fetching}
                    totalCount={data?.inputsConnection.totalCount ?? 0}
                />
            </Paginated>
        </Stack>
    );
};

export default Inputs;
