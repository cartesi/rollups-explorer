"use client";
import {
    Anchor,
    Breadcrumbs,
    Card,
    Divider,
    Flex,
    Grid,
    Group,
    Stack,
    Table,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { FC } from "react";
import { IconType } from "react-icons";
import { TbApps, TbInbox } from "react-icons/tb";
import InputRow from "../components/inputRow";
import TweenedNumber from "../components/tweenedNumber";
import { useInputsQuery, useStatsQuery } from "../graphql/index";

interface SummaryItem {
    icon: IconType;
    title: string;
    value: number;
}

interface SummaryProps {
    items: SummaryItem[];
}

const Summary = ({ items }: SummaryProps) => {
    const theme = useMantineTheme();
    const matches = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);

    return (
        <Grid gutter="md">
            {items.map((summary) => (
                <Grid.Col
                    key={summary.title}
                    span={{ base: 12, md: 6 }}
                    my="md"
                >
                    <Card radius="md" shadow="xs">
                        <Flex align="center" gap={10}>
                            <summary.icon size={36} />
                            <Flex direction="column" columnGap={2}>
                                <Text c="dimmed">{summary.title}</Text>
                                <Text fw="bold" fz="2rem">
                                    <TweenedNumber value={summary.value} />
                                </Text>
                            </Flex>
                        </Flex>
                    </Card>
                </Grid.Col>
            ))}
        </Grid>
    );
};

const Explorer: FC = (props) => {
    const [{ data: stats }] = useStatsQuery();
    const [{ data }] = useInputsQuery();
    const summaries: SummaryItem[] = [
        {
            icon: TbInbox,
            title: "Inputs",
            value: stats?.inputsConnection.totalCount ?? 0,
        },
        {
            icon: TbApps,
            title: "Applications",
            value: stats?.applicationsConnection.totalCount ?? 0,
        },
    ];

    return (
        <Stack>
            <Breadcrumbs>
                <Anchor>Home</Anchor>
            </Breadcrumbs>

            <Summary items={summaries} />

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
