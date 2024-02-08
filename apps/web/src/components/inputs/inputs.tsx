"use client";

import { Stack } from "@mantine/core";
import { FC, useCallback, useState } from "react";
import { InputOrderByInput, useInputsConnectionQuery } from "../../graphql";
import { checkQuery } from "../../lib/query";
import InputsTable from "../inputs/inputsTable";
import Paginated from "../paginated";
import Search from "../search";

export type InputsProps = {
    orderBy?: InputOrderByInput;
    applicationId?: string;
};

const Inputs: FC<InputsProps> = ({
    orderBy = InputOrderByInput.TimestampDesc,
    applicationId,
}) => {
    const [query, setQuery] = useState("");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();

    const [{ data: data, fetching: fetching }] = useInputsConnectionQuery({
        variables: {
            orderBy,
            limit,
            after,
            where: checkQuery(
                query.toLowerCase(),
                applicationId?.toLowerCase(),
            ),
        },
    });
    const inputs = data?.inputsConnection.edges.map((edge) => edge.node) ?? [];

    const onChangePagination = useCallback((limit: number, page: number) => {
        setLimit(limit);
        setPage(page);
    }, []);

    const onSubmitQuery = useCallback((query: string) => {
        setQuery(query);
    }, []);

    return (
        <Stack>
            <Search onSubmit={onSubmitQuery} />
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
