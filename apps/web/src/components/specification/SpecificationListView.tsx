"use client";
import {
    Accordion,
    Badge,
    Button,
    Card,
    Grid,
    Group,
    JsonInput,
    Stack,
    Table,
    Text,
    Title,
    VisuallyHidden,
    useMantineTheme,
} from "@mantine/core";
import { isEmpty, prop } from "ramda";
import { isNilOrEmpty, isNotNilOrEmpty } from "ramda-adjunct";
import { FC } from "react";
import { TbTrash } from "react-icons/tb";
import { useSpecification } from "./hooks/useSpecification";
import {
    Predicate,
    SliceInstruction,
    inputProperties,
    operators,
} from "./types";
import { stringifyContent } from "./utils";

const inputPropLabel: Record<string, string> = inputProperties.reduce(
    (prev, curr) => {
        return {
            ...prev,
            [curr.value]: curr.label,
        };
    },
    {},
);

const operatorLabel: Record<string, string> = operators.reduce(
    (prev, curr) => ({ ...prev, [curr.value]: curr.label }),
    {},
);

const DisplayInstructions: FC<{ slices: SliceInstruction[] | undefined }> = ({
    slices,
}) => {
    if (isNilOrEmpty(slices)) return "";

    const rows = slices?.map((slice, idx) => (
        <Table.Tr key={slice.name} data-testid={`${idx}-${slice.name}`}>
            <Table.Td>{slice.name}</Table.Td>
            <Table.Td>{slice.from}</Table.Td>
            <Table.Td>{slice.to ?? "end of bytes"}</Table.Td>
            <Table.Td>{`${isEmpty(slice.type) ? "Hex" : slice.type}`}</Table.Td>
        </Table.Tr>
    ));

    return (
        <Accordion.Item
            key="abi-params-slices-item"
            value="abi-params-slices-item"
        >
            <Accordion.Control>
                <Title order={4}>ABI Parameters (Slices)</Title>
            </Accordion.Control>

            <Accordion.Panel>
                <Table
                    horizontalSpacing="xl"
                    highlightOnHover
                    data-testid="slices-readonly-table"
                >
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th style={{ whiteSpace: "nowrap" }}>
                                Name
                            </Table.Th>
                            <Table.Th style={{ whiteSpace: "nowrap" }}>
                                From
                            </Table.Th>
                            <Table.Th style={{ whiteSpace: "nowrap" }}>
                                To
                            </Table.Th>
                            <Table.Th style={{ whiteSpace: "nowrap" }}>
                                Type
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </Accordion.Panel>
        </Accordion.Item>
    );
};

const DisplayConditional: FC<{ conditionals: Predicate[] }> = ({
    conditionals,
}) => {
    if (isNilOrEmpty(conditionals)) return null;

    const conditions = conditionals[0].conditions;
    const logicalOperator = conditionals[0].logicalOperator;
    const addLogicalOperator = conditions.length > 1;

    return (
        <Accordion.Item
            key="specification-conditions-item"
            value="specification-conditions-item"
        >
            <Accordion.Control>
                <Title order={4}>Conditions</Title>
            </Accordion.Control>

            <Accordion.Panel>
                {conditions.map((condition, idx) => (
                    <Stack key={idx} gap="xs">
                        {idx < 1 && <Title order={4}>When</Title>}
                        <Group pl="md">
                            <Text fw="bold">
                                {prop(condition.field, inputPropLabel)}
                            </Text>
                            <Text c="dimmed">is</Text>
                            <Text style={{ textTransform: "lowercase" }}>
                                {prop(condition.operator, operatorLabel)}
                            </Text>
                            <Text c="dimmed">to</Text>
                            <Text fw="bold">{condition.value}</Text>
                            {idx === 0 && addLogicalOperator && (
                                <Text
                                    fw="bold"
                                    style={{ textTransform: "uppercase" }}
                                >
                                    {logicalOperator}
                                </Text>
                            )}
                        </Group>
                    </Stack>
                ))}
            </Accordion.Panel>
        </Accordion.Item>
    );
};

export const SpecificationListView: FC = () => {
    const theme = useMantineTheme();
    const { fetching, listSpecifications, removeSpecification } =
        useSpecification();
    const specifications = listSpecifications();

    if (fetching) return <h1>Loading!!!</h1>;

    if (isNilOrEmpty(specifications)) return <h1>No Specifications found!</h1>;

    return (
        <Grid justify="flex-start" align="stretch">
            {specifications?.map((spec) => (
                <Grid.Col span={{ base: 12, md: 6 }} key={spec.id}>
                    <Card style={{ minHeight: 300 }}>
                        <Card.Section inheritPadding py="sm">
                            <Group justify="space-between" wrap="nowrap">
                                <Title
                                    order={3}
                                    lineClamp={1}
                                    title={spec.name}
                                >
                                    {spec.name}
                                </Title>
                                <Button
                                    aria-label={`remove-${spec.id!}`}
                                    role="button"
                                    size="compact-sm"
                                    variant="transparent"
                                    color="red"
                                    data-testid="remove-connection"
                                    onClick={() =>
                                        removeSpecification(spec.id!)
                                    }
                                >
                                    <TbTrash size={theme.other.iconSize} />
                                    <VisuallyHidden>
                                        Remove specification id {spec.id}
                                    </VisuallyHidden>
                                </Button>
                            </Group>
                        </Card.Section>
                        <Badge>
                            {spec.mode === "abi_params"
                                ? "ABI Parameters"
                                : "Json ABI"}
                        </Badge>

                        <Accordion
                            variant="default"
                            chevronPosition="right"
                            py="sm"
                        >
                            {spec.mode === "json_abi" && (
                                <Accordion.Item key="abi-item" value="abi-item">
                                    <Accordion.Control>
                                        <Title order={4}>ABI</Title>
                                    </Accordion.Control>

                                    <Accordion.Panel>
                                        <JsonInput
                                            value={stringifyContent(
                                                spec.abi ?? [],
                                            )}
                                            readOnly
                                            variant="transparent"
                                            autosize
                                        />
                                    </Accordion.Panel>
                                </Accordion.Item>
                            )}

                            {spec.mode === "abi_params" && (
                                <>
                                    <Accordion.Item
                                        key="abi-params-item"
                                        value="abi-params-item"
                                    >
                                        <Accordion.Control>
                                            <Title order={4}>
                                                ABI Parameters
                                            </Title>
                                        </Accordion.Control>

                                        <Accordion.Panel>
                                            <Stack>
                                                <JsonInput
                                                    variant="transparent"
                                                    readOnly
                                                    autosize
                                                    value={stringifyContent(
                                                        spec.abiParams,
                                                    )}
                                                />

                                                {isNotNilOrEmpty(
                                                    spec.sliceTarget,
                                                ) && (
                                                    <Text c="dimmed">
                                                        It will be used on slice
                                                        named {spec.sliceTarget}
                                                    </Text>
                                                )}
                                            </Stack>
                                        </Accordion.Panel>
                                    </Accordion.Item>

                                    <DisplayInstructions
                                        slices={spec.sliceInstructions}
                                    />
                                </>
                            )}
                            <DisplayConditional
                                conditionals={spec.conditionals ?? []}
                            />
                        </Accordion>
                    </Card>
                </Grid.Col>
            ))}
        </Grid>
    );
};
