"use client";
import { CodeHighlight } from "@mantine/code-highlight";
import {
    Accordion,
    Badge,
    Box,
    Button,
    Card,
    Center,
    FileButton,
    Flex,
    Grid,
    Group,
    Modal,
    SegmentedControl,
    Skeleton,
    Stack,
    Table,
    Text,
    Title,
    useMantineTheme,
    VisuallyHidden,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { cond, filter, isEmpty, propEq, range, T } from "ramda";
import { isNilOrEmpty, isNotNilOrEmpty } from "ramda-adjunct";
import React, { FC, useState } from "react";
import { TbTrash } from "react-icons/tb";
import { Abi } from "viem";
import { EditSpecificationButton } from "./components/EditSpecificationButton";
import { NewSpecificationButton } from "./components/NewSpecificationButton";
import { patchField } from "./conditionals";
import { useSpecification } from "./hooks/useSpecification";
import {
    ABI_PARAMS,
    Condition,
    ConditionalOperator,
    inputProperties,
    JSON_ABI,
    logicalOperators,
    Modes,
    operators,
    Predicate,
    SliceInstruction,
    Specification,
} from "./types";
import { stringifyContent } from "./utils";
import { SpecificationsActionsMenu } from "./components/SpecificationsActionsMenu";
import { useSpecificationsTransfer } from "./hooks/useSpecificationsTransfer";

const CARD_MIN_HEIGHT = 300 as const;

type ValueLabelList =
    | typeof operators
    | typeof logicalOperators
    | typeof inputProperties;

const reduceValueLabel = (list: ValueLabelList): Record<string, string> =>
    list.reduce((prev, curr) => {
        return {
            ...prev,
            [curr.value]: curr.programmingLabel,
        };
    }, {});

const inputPropLabel = reduceValueLabel(inputProperties);
const operatorLabel = reduceValueLabel(operators);
const logicalOperatorsLabel = reduceValueLabel(logicalOperators);

const DisplayABIParams: FC<{
    abiParams: readonly string[];
    sliceTarget?: string;
}> = ({ abiParams, sliceTarget }) => (
    <Accordion.Item key="abi-params-item" value="abi-params-item">
        <Accordion.Control>
            <Title order={3} size="lg">
                ABI Parameters
            </Title>
        </Accordion.Control>

        <Accordion.Panel>
            <Stack>
                {abiParams.map((param, idx) => (
                    <CodeHighlight
                        withCopyButton={false}
                        language="solidity"
                        code={param}
                        key={idx}
                    />
                ))}
                {isNotNilOrEmpty(sliceTarget) && (
                    <Text c="dimmed">
                        It will be used on slice named {sliceTarget}
                    </Text>
                )}
            </Stack>
        </Accordion.Panel>
    </Accordion.Item>
);

const DisplayABI: FC<{ abi: Abi }> = ({ abi }) => (
    <Accordion.Item key="abi-item" value="abi-item">
        <Accordion.Control>
            <Title order={3} size="lg">
                ABI
            </Title>
        </Accordion.Control>

        <Accordion.Panel>
            <CodeHighlight
                code={stringifyContent(abi ?? [])}
                withCopyButton={false}
                language="json"
            />
        </Accordion.Panel>
    </Accordion.Item>
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

const buildConditionalExpression = (cond: Condition) =>
    `\n  ${inputPropLabel[patchField(cond.field)]} ${
        operatorLabel[cond.operator]
    } "${cond.value}"`;

const codeGenerator = (
    conditions: Condition[],
    logicalOperator: ConditionalOperator,
) => {
    let template = `if (`;

    conditions.forEach((cond, idx) => {
        if (idx === 0) {
            template += buildConditionalExpression(cond);
        } else {
            template += ` ${
                logicalOperatorsLabel[logicalOperator]
            }${buildConditionalExpression(cond)}`;
        }
    });

    template += "\n)";

    return template;
};

const DisplayConditional: FC<{ conditionals: Predicate[] }> = ({
    conditionals,
}) => {
    if (isNilOrEmpty(conditionals)) return null;

    const conditions = conditionals[0].conditions;
    const logicalOperator = conditionals[0].logicalOperator;

    return (
        <Accordion.Item
            key="specification-conditions-item"
            value="specification-conditions-item"
        >
            <Accordion.Control>
                <Title order={4}>Conditions</Title>
            </Accordion.Control>

            <Accordion.Panel>
                <CodeHighlight
                    code={codeGenerator(conditions, logicalOperator)}
                    language="ts"
                    withCopyButton={false}
                />
            </Accordion.Panel>
        </Accordion.Item>
    );
};

const Feedback: FC = () => (
    <Grid justify="flex-start" align="stretch" data-testid="fetching-feedback">
        {range(0, 4).map((n) => (
            <Grid.Col span={{ base: 12, md: 6 }} key={n}>
                <Card style={{ minHeight: CARD_MIN_HEIGHT }}>
                    <Group justify="space-between">
                        <Skeleton height={18} mb="xl" width="70%" />
                        <Skeleton height={18} mb="xl" width="5%" />
                    </Group>
                    <Skeleton height={8} mb="xl" width="20%" />
                    <Skeleton height={21} my="xs" />
                    <Skeleton height={21} my="xs" />
                    <Skeleton height={21} my="xs" />
                </Card>
            </Grid.Col>
        ))}
    </Grid>
);

const NoSpecifications: FC = () => {
    const { resetFileRef, onUploadFile } = useSpecificationsTransfer();

    return (
        <Center>
            <Flex direction="column" align="center" justify="center">
                <Title order={3} c="dimmed" size="lg">
                    No Specifications Found!
                </Title>
                <Box my={8}>
                    <NewSpecificationButton btnText="Create one" />
                </Box>
                <Box>or</Box>
                <Box mt={9}>
                    <FileButton
                        resetRef={resetFileRef}
                        accept="application/json"
                        onChange={onUploadFile}
                    >
                        {(props) => (
                            <Button {...props}>Import specifications</Button>
                        )}
                    </FileButton>
                </Box>
            </Flex>
        </Center>
    );
};

const NoSpecificationsFiltered: FC<{
    quantity: number;
    filterName: string;
}> = ({ filterName, quantity }) => {
    const filterType = filterName === JSON_ABI ? "JSON ABI" : "ABI Params";
    return (
        <Center py="lg">
            <Group gap="xs" data-testid="no-specification-filtered-message">
                <Title order={3} c="dimmed" size="lg">
                    {quantity > 1 &&
                        `You have ${quantity} specifications, but none of them are the type`}{" "}
                    {quantity === 1 &&
                        `You have one specification but it is not the type`}
                </Title>
                <Badge>{filterType}</Badge>
            </Group>
        </Center>
    );
};

type ModeFilter = "all" | Modes;

type FilterByMode = (value: {
    filterBy: ModeFilter;
    list: Specification[];
}) => Specification[];

const filterByMode = cond<Parameters<FilterByMode>, ReturnType<FilterByMode>>([
    [({ filterBy }) => filterBy === "all", ({ list }) => list],
    [T, ({ filterBy, list }) => filter(propEq(filterBy, "mode"), list)],
]);

export const SpecificationListView: FC = () => {
    const theme = useMantineTheme();
    const [filter, setFilter] = useState<ModeFilter>("all");
    const { fetching, listSpecifications, removeSpecification } =
        useSpecification();

    const specifications = listSpecifications();
    const [opened, { open, close }] = useDisclosure(false);
    const [specForRemoval, setSpecForRemoval] = useState<Specification | null>(
        null,
    );

    if (fetching) return <Feedback />;
    if (isNilOrEmpty(specifications)) return <NoSpecifications />;

    const filteredSpecs = filterByMode({
        filterBy: filter,
        list: specifications ?? [],
    });

    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                title="Delete specification?"
                centered
            >
                <Text>
                    This will delete the data for this specification. Are you
                    sure you want to proceed?
                </Text>

                <Group mt="xl" justify="flex-end">
                    <Button variant="default" onClick={close}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (specForRemoval) {
                                removeSpecification(specForRemoval.id!);
                            }
                            close();
                        }}
                    >
                        Confirm
                    </Button>
                </Group>
            </Modal>
            <Stack>
                <Flex justify="stretch">
                    <Group mr="auto">
                        <SegmentedControl
                            data-testid="specification-filter-control"
                            data={[
                                { value: "all", label: "All" },
                                { value: JSON_ABI, label: "JSON ABI" },
                                { value: ABI_PARAMS, label: "ABI Params" },
                            ]}
                            value={filter}
                            onChange={(value) => setFilter(value as ModeFilter)}
                        />
                        <Group>
                            <NewSpecificationButton />
                            <SpecificationsActionsMenu />
                        </Group>
                    </Group>
                </Flex>

                {isNilOrEmpty(filteredSpecs) && (
                    <NoSpecificationsFiltered
                        filterName={filter}
                        quantity={specifications?.length ?? 0}
                    />
                )}

                <Grid
                    justify="flex-start"
                    align="stretch"
                    data-testid="specs-grid"
                    role="grid"
                >
                    {filteredSpecs?.map((spec) => (
                        <Grid.Col
                            span={{ base: 12, md: 6 }}
                            key={spec.id}
                            role="row"
                        >
                            <Card
                                style={{ minHeight: CARD_MIN_HEIGHT }}
                                data-testid={`specification-${spec.id}-card`}
                                role="gridcell"
                            >
                                <Card.Section
                                    inheritPadding
                                    py="sm"
                                    data-testid={`specification-${spec.id}`}
                                >
                                    <Group
                                        justify="space-between"
                                        wrap="nowrap"
                                    >
                                        <Title
                                            order={2}
                                            lineClamp={1}
                                            title={spec.name}
                                            size="xl"
                                        >
                                            {spec.name}
                                        </Title>
                                        <Group gap={0} wrap="nowrap">
                                            <EditSpecificationButton
                                                id={spec.id!}
                                                iconSize={theme.other.iconSize}
                                            />
                                            <Button
                                                aria-label={`remove-${spec.name}`}
                                                role="button"
                                                size="compact-sm"
                                                variant="transparent"
                                                color="red"
                                                data-testid={`remove-specification-${spec.id}`}
                                                onClick={() => {
                                                    setSpecForRemoval(spec);
                                                    open();
                                                }}
                                            >
                                                <TbTrash
                                                    size={theme.other.iconSize}
                                                />
                                                <VisuallyHidden>
                                                    Remove specification id{" "}
                                                    {spec.id}
                                                </VisuallyHidden>
                                            </Button>
                                        </Group>
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
                                    data-testid={`specification-${spec.id}-accordion`}
                                >
                                    {spec.mode === "json_abi" && (
                                        <DisplayABI abi={spec.abi} />
                                    )}

                                    {spec.mode === "abi_params" && (
                                        <>
                                            <DisplayABIParams
                                                abiParams={spec.abiParams}
                                                sliceTarget={spec.sliceTarget}
                                            />
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
            </Stack>
        </>
    );
};
