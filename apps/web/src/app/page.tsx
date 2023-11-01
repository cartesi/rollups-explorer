"use client";
import { Summary } from "@cartesi/rollups-explorer-ui";
import {
    Anchor,
    Breadcrumbs,
    Group,
    Pagination,
    Select,
    Stack,
    Table,
    Text,
    Title,
} from "@mantine/core";
import { FC, useEffect, useState } from "react";
import { TbInbox } from "react-icons/tb";

import { useScrollIntoView } from "@mantine/hooks";
import { pathOr } from "ramda";
import InputRow from "../components/inputRow";
import {
    InputOrderByInput,
    useInputsQuery,
    useStatsQuery,
} from "../graphql/index";
import { limitBounds, usePaginationParams } from "../hooks/usePaginationParams";

const Explorer: FC = (props) => {
    const [{ limit, page }, updateParams] = usePaginationParams();
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();
    const [{ data: stats }] = useStatsQuery();
    const [{ data, fetching }] = useInputsQuery({
        variables: {
            orderBy: InputOrderByInput.TimestampDesc,
            limit,
            after,
        },
    });
    const totalInputs = data?.inputsConnection.totalCount ?? 1;
    const totalPages = Math.ceil(totalInputs / limit);
    const [activePage, setActivePage] = useState(
        page > totalPages ? totalPages : page
    );

    const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
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
            <Breadcrumbs>
                <Anchor>Home</Anchor>
            </Breadcrumbs>

            <Summary
                inputs={stats?.inputsConnection?.totalCount ?? 0}
                applications={stats?.applicationsConnection?.totalCount ?? 0}
            />

            <Group ref={targetRef}>
                <TbInbox size={40} />
                <Title order={2}>Inputs</Title>
            </Group>

            <Stack>
                <Pagination
                    styles={{ root: { alignSelf: "flex-end" } }}
                    value={activePage}
                    total={totalPages}
                    onChange={(pageN) => {
                        updateParams(pageN, limit);
                    }}
                />
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>From</Table.Th>
                            <Table.Th></Table.Th>
                            <Table.Th>To</Table.Th>
                            <Table.Th>Method</Table.Th>
                            <Table.Th>Index</Table.Th>
                            <Table.Th>Age</Table.Th>
                            <Table.Th>Data</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {data?.inputsConnection.edges.map(({ node: input }) => (
                            <InputRow key={input.id} input={input} />
                        ))}
                    </Table.Tbody>
                </Table>

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
        </Stack>
    );
};

export default Explorer;
