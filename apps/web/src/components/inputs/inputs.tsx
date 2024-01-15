"use client";

import { Stack } from "@mantine/core";
import { FC, useCallback, useEffect, useState } from "react";
import { InputOrderByInput, useInputsQuery } from "../../graphql";
import InputsTable from "../inputs/inputsTable";
import Paginated from "../paginated";

export type InputsProps = {
    orderBy?: InputOrderByInput;
    applicationId?: string;
};

const Inputs: FC<InputsProps> = ({
    orderBy = InputOrderByInput.TimestampDesc,
    applicationId,
}) => {
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();
    const [{ data, fetching }] = useInputsQuery({
        variables: {
            orderBy,
            applicationId: applicationId?.toLowerCase(),
            limit,
            after,
        },
    });
    const inputs = data?.inputsConnection.edges.map((edge) => edge.node) ?? [];

    const onChangePagination = useCallback((limit: number, page: number) => {
        setLimit(limit);
        setPage(page);
    }, []);

    return (
        <Stack>
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
