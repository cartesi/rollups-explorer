"use client";
import {
    Anchor,
    Breadcrumbs,
    Divider,
    Grid,
    Group,
    Stack,
    Table,
    Title,
} from "@mantine/core";
import { FC } from "react";
import { TbApps, TbInbox } from "react-icons/tb";
import { SummaryCard } from "@cartesi/rollups-explorer-ui";

import InputRow from "../components/inputRow";
import { useInputsQuery, useStatsQuery } from "../graphql/index";

interface SummaryProps {
    inputs: number;
    applications: number;
}

const Summary = ({ inputs, applications }: SummaryProps) => {
    return (
        <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }} my="md">
                <SummaryCard title="Inputs" icon={TbInbox} value={inputs} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }} my="md">
                <SummaryCard
                    title="Applications"
                    icon={TbApps}
                    value={applications}
                />
            </Grid.Col>
        </Grid>
    );
};

const Explorer: FC = (props) => {
    const [{ data: stats }] = useStatsQuery();
    const [{ data }] = useInputsQuery();

    return (
        <Stack>
            <Breadcrumbs>
                <Anchor>Home</Anchor>
            </Breadcrumbs>

            <Summary
                inputs={stats?.inputsConnection.totalCount ?? 0}
                applications={stats?.applicationsConnection.totalCount ?? 0}
            />

            <Divider
                labelPosition="left"
                label={
                    <Group>
                        <TbInbox size={40} />
                        <Title order={3}>Inputs</Title>
                    </Group>
                }
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
                    {data?.inputs.map((input) => (
                        <InputRow key={input.id} input={input} />
                    ))}
                </Table.Tbody>
            </Table>
        </Stack>
    );
};

export default Explorer;
