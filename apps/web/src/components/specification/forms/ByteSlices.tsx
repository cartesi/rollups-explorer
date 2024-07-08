import {
    Accordion,
    Button,
    Checkbox,
    Collapse,
    Fieldset,
    Group,
    NumberInput,
    Select,
    Stack,
    Switch,
    Table,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { AbiType } from "abitype";
import {
    any,
    anyPass,
    clone,
    gt,
    gte,
    isEmpty,
    isNil,
    lt,
    reject,
} from "ramda";
import { FC, useEffect, useRef, useState } from "react";
import {
    TbArrowsDiagonal,
    TbArrowsDiagonalMinimize2,
    TbTrash,
} from "react-icons/tb";
import { useSpecFormContext } from "../formContext";
import { SliceInstruction } from "../types";

interface Props {
    slices: SliceInstruction[];
    onSliceChange: (slices: SliceInstruction[]) => void;
}

const InstructionsReview: FC<Props> = ({ slices, onSliceChange }) => {
    if (slices.length === 0) return "";

    const rows = slices.map((slice, idx) => (
        <Table.Tr key={slice.name} data-testid={`${idx}-${slice.name}`}>
            <Table.Td>{slice.name}</Table.Td>
            <Table.Td>{slice.from}</Table.Td>
            <Table.Td>{slice.to ?? "end of bytes"}</Table.Td>
            <Table.Td>{`${isEmpty(slice.type) ? "Hex" : slice.type}`}</Table.Td>
            <Table.Td>
                <Button
                    size="compact-sm"
                    color="red"
                    onClick={() => {
                        const newVal = reject(
                            (i: SliceInstruction) => i.name === slice.name,
                            slices,
                        );

                        onSliceChange(newVal);
                    }}
                >
                    <TbTrash />
                </Button>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Accordion variant="contained" chevronPosition="right" py="sm">
            <Accordion.Item
                key="byte-slice-instructions"
                value="byte-slice-instructions"
            >
                <Accordion.Control>
                    <Title order={4}>Review your definition</Title>
                </Accordion.Control>

                <Accordion.Panel>
                    <Table
                        horizontalSpacing="xl"
                        highlightOnHover
                        data-testid="batch-review-table"
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
                                <Table.Th style={{ whiteSpace: "nowrap" }}>
                                    Action
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
};

const initialValues = {
    slices: [] as SliceInstruction[],
    sliceInput: {
        name: "",
        from: "",
        to: "",
        type: "",
    },
};

const isNilOrEmpty = anyPass([isNil, isEmpty]);

const SliceInstructionFields: FC = () => {
    const [checked, { toggle: toggleTarget }] = useDisclosure(false);
    const [sliceTarget, setSliceTarget] = useState<string | null>(null);
    const [expanded, { toggle }] = useDisclosure(true);
    const sliceNameRef = useRef<HTMLInputElement>(null);
    const mainForm = useSpecFormContext();
    const form = useForm({
        initialValues: clone(initialValues),
        validateInputOnChange: true,
        validate: {
            sliceInput: {
                name: (value, values) => {
                    if (isNilOrEmpty(value)) return "Name is required!";

                    if (
                        values.slices.length > 0 &&
                        any((slice) => slice.name === value, values.slices)
                    ) {
                        return `Duplicated name. Check review`;
                    }

                    return null;
                },
                from: (value, values) => {
                    if (isNilOrEmpty(value)) return "From is required!";

                    if (
                        !isNilOrEmpty(values.sliceInput.to) &&
                        value > values.sliceInput.to
                    )
                        return "From can't be bigger than To value.";

                    const from = parseInt(value);

                    if (
                        values.slices.length > 0 &&
                        any((slice) => {
                            if (slice.to === undefined || slice.to === null) {
                                return gte(from, slice.from);
                            }

                            return gt(from, slice.from) && lt(from, slice.to);
                        }, values.slices)
                    ) {
                        return "Overlap with added entry! Check review.";
                    }
                    return null;
                },
            },
        },
    });

    const { slices, sliceInput } = form.getTransformedValues();

    const sliceNames = slices.map((slice, idx) => slice.name ?? `slice-${idx}`);

    useEffect(() => {
        mainForm.setFieldValue("sliceInstructions", clone(slices));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slices]);

    return (
        <Stack>
            <Fieldset p="xs">
                <Group justify="space-between">
                    <Text fw="bold">Define a slice</Text>
                    <Button
                        onClick={toggle}
                        size="compact-sm"
                        px="sm"
                        variant="light"
                    >
                        {expanded ? (
                            <TbArrowsDiagonalMinimize2 size={21} />
                        ) : (
                            <TbArrowsDiagonal size={21} />
                        )}
                    </Button>
                </Group>
                <Collapse
                    in={expanded}
                    onTransitionEnd={() => sliceNameRef.current?.focus()}
                >
                    <Stack mt="sm">
                        <TextInput
                            autoFocus
                            ref={sliceNameRef}
                            data-testid="slice-name-input"
                            label="Name"
                            description="Name to set the decoded value in the final object result."
                            placeholder="amount"
                            withAsterisk
                            {...form.getInputProps("sliceInput.name")}
                            error={form.getInputProps("sliceInput.name").error}
                        />
                        <NumberInput
                            allowNegative={false}
                            allowDecimal={false}
                            hideControls
                            data-testid="slice-from-input"
                            label="From"
                            description="Point to start the reading"
                            required
                            placeholder="e.g 0"
                            key="sliceInput.from"
                            {...form.getInputProps("sliceInput.from")}
                        />
                        <NumberInput
                            allowNegative={false}
                            allowDecimal={false}
                            hideControls
                            data-testid="slice-to-input"
                            label="To"
                            description="Optional: Empty means from defined number until the end of the bytes."
                            placeholder="e.g 20"
                            key="sliceInput.to"
                            {...form.getInputProps("sliceInput.to")}
                        />
                        <TextInput
                            label="Type"
                            data-testid="slice-type-input"
                            placeholder="e.g. uint"
                            description="Optional: Empty means return slice value as-is (i.e. Hex.)"
                            key="sliceInput.type"
                            {...form.getInputProps("sliceInput.type")}
                        />
                    </Stack>
                    <Group justify="flex-end" mt="md">
                        <Button
                            size="sm"
                            disabled={!form.isValid("sliceInput")}
                            data-testid="add-byte-slice-button"
                            onClick={() => {
                                const name = sliceInput.name;
                                const type = sliceInput.type as AbiType;
                                const from = parseInt(sliceInput?.from ?? "0");
                                const to =
                                    !isNil(sliceInput?.to) &&
                                    !isEmpty(sliceInput.to)
                                        ? parseInt(sliceInput?.to)
                                        : undefined;

                                const slice: SliceInstruction = {
                                    from,
                                    to,
                                    name,
                                    type,
                                };

                                const newSlices = [...(slices ?? []), slice];

                                form.setValues({
                                    sliceInput: clone(initialValues.sliceInput),
                                    slices: newSlices,
                                });
                                sliceNameRef.current?.focus();
                            }}
                        >
                            Add
                        </Button>
                    </Group>
                </Collapse>
            </Fieldset>

            <InstructionsReview
                slices={slices}
                onSliceChange={(slices) => {
                    form.setFieldValue("slices", slices);
                }}
            />

            {sliceNames && sliceNames.length > 0 ? (
                <Group>
                    <Checkbox
                        checked={checked}
                        onChange={() => {
                            toggleTarget();
                            if (sliceTarget !== null) {
                                setSliceTarget(null);
                                mainForm.setFieldValue(
                                    "sliceTarget",
                                    undefined,
                                );
                            }
                        }}
                        label="Use ABI Parameter definition on"
                    />
                    <Select
                        key={sliceNames.join(",")}
                        placeholder="Pick a slice"
                        data={sliceNames}
                        disabled={!checked}
                        value={sliceTarget}
                        onChange={(value) => {
                            setSliceTarget(value);
                            mainForm.setFieldValue(
                                "sliceTarget",
                                value ?? undefined,
                            );
                        }}
                    />
                </Group>
            ) : (
                ""
            )}
        </Stack>
    );
};

export const ByteSlices: FC = () => {
    const [checked, { toggle }] = useDisclosure(false);

    return (
        <Stack>
            <Group justify="space-between" align="normal" wrap="nowrap">
                <Stack gap={0}>
                    <Text component="span" fw="bold">
                        Add decoding steps by byte range
                    </Text>
                    <Text size="xs" c="dimmed" component="span">
                        Helpful when using non-standard abi-encoding.
                    </Text>
                </Stack>
                <Switch
                    checked={checked}
                    onClick={toggle}
                    data-testid="add-byte-slice-switch"
                />
            </Group>

            {checked ? (
                <Stack pl="sm">
                    <SliceInstructionFields />
                </Stack>
            ) : (
                ""
            )}
        </Stack>
    );
};
