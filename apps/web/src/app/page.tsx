"use client";
import {
    Anchor,
    Breadcrumbs,
    Card,
    Divider,
    Flex,
    Group,
    Stack,
    Table,
    Text,
    Title,
} from "@mantine/core";
import { FC } from "react";
import { TbApps, TbInbox } from "react-icons/tb";
import InputRow from "../components/inputRow";
import { useInputsQuery, useStatsQuery } from "../graphql/index";

const Explorer: FC = (props) => {
    const [{ data: stats }] = useStatsQuery();
    const [{ data }] = useInputsQuery();
    return (
        <Stack>
            <Breadcrumbs>
                <Anchor>Home</Anchor>
            </Breadcrumbs>

            <Group grow>
                <Card w={200} radius="md" shadow="xs">
                    <Flex align="center" gap={10}>
                        <TbInbox size={36} />
                        <Flex direction="column" columnGap={2}>
                            <Text c="dimmed">Inputs</Text>
                            <Text fw="bold" fz="2rem">
                                {stats?.inputsConnection.totalCount}
                            </Text>
                        </Flex>
                    </Flex>
                </Card>
                <Card w={200} radius="md" shadow="xs">
                    <Flex align="center" gap={10}>
                        <TbApps size={36} />
                        <Flex direction="column">
                            <Text c="dimmed" p={0}>
                                Applications
                            </Text>
                            <Text fw="bold" fz="2rem">
                                {stats?.applicationsConnection.totalCount}
                            </Text>
                        </Flex>
                    </Flex>
                </Card>
            </Group>
            <Divider
                mt="xl"
                mb="md"
                labelPosition="center"
                label={
                    <Group gap={1}>
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
