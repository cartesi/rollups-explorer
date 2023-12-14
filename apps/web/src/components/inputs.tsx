"use client";

import { Group, Pagination, Select, Stack, Text } from "@mantine/core";
import { useScrollIntoView } from "@mantine/hooks";
import { pathOr } from "ramda";
import { FC, useEffect, useState } from "react";
import { InputOrderByInput, useInputsQuery } from "../graphql";
import { limitBounds, usePaginationParams } from "../hooks/usePaginationParams";
import InputsTable from "../components/inputsTable";

export type InputsProps = {
    orderBy?: InputOrderByInput;
    applicationId?: string;
};

const Inputs: FC<InputsProps> = ({
    orderBy = InputOrderByInput.TimestampDesc,
    applicationId,
}) => {
    const [{ limit, page }, updateParams] = usePaginationParams();
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();
    const [{ data, fetching }] = useInputsQuery({
        variables: {
            orderBy,
            applicationId: applicationId?.toLowerCase(),
            limit,
            after,
        },
    });
    const totalInputs = data?.inputsConnection.totalCount ?? 1;
    const totalPages = Math.ceil(totalInputs / limit);
    const [activePage, setActivePage] = useState(
        page > totalPages ? totalPages : page,
    );
    const inputs = data?.inputsConnection.edges.map((edge) => edge.node) ?? [];
    const { scrollIntoView } = useScrollIntoView<HTMLDivElement>({
        duration: 700,
        offset: 150,
        cancelable: true,
    });

    if (!fetching && page > totalPages) {
        updateParams(totalPages, limit);
    }

    useEffect(() => {
        setActivePage((n) => {
            return n !== page ? page : n;
        });
    }, [page]);

    return (
        <Stack>
            <Pagination
                styles={{ root: { alignSelf: "flex-end" } }}
                value={activePage}
                total={totalPages}
                onChange={(pageN) => {
                    updateParams(pageN, limit);
                }}
            />

            <InputsTable inputs={inputs} />

            <Group justify="space-between" align="center">
                <Group>
                    <Text>Show:</Text>
                    <Select
                        style={{ width: "5rem" }}
                        value={limit.toString()}
                        onChange={(val) => {
                            const entry = val ?? limit;
                            const l = pathOr(limit, [entry], limitBounds);
                            updateParams(page, l);
                        }}
                        data={[
                            limitBounds[10].toString(),
                            limitBounds[20].toString(),
                            limitBounds[30].toString(),
                        ]}
                    />
                    <Text>inputs</Text>
                </Group>
                <Pagination
                    styles={{ root: { alignSelf: "flex-end" } }}
                    value={activePage}
                    total={totalPages}
                    onChange={(pageN) => {
                        updateParams(pageN, limit);
                        scrollIntoView({ alignment: "center" });
                    }}
                />
            </Group>
        </Stack>
    );
};

export default Inputs;
