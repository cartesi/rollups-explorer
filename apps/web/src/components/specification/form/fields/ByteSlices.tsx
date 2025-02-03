import {
    Accordion,
    Button,
    Checkbox,
    Collapse,
    Fieldset,
    Flex,
    Group,
    NumberInput,
    Select,
    Stack,
    Switch,
    Table,
    Text,
    TextInput,
    Title,
    Tooltip,
    useMantineTheme,
    VisuallyHidden,
} from "@mantine/core";
import { createFormActions, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { AbiType } from "abitype";
import { any, clone, gt, gte, isEmpty, isNil, lt, reject } from "ramda";
import {
    isBlank,
    isBoolean,
    isFunction,
    isNilOrEmpty,
    isNotNilOrEmpty,
} from "ramda-adjunct";
import { FC, ReactNode, useEffect, useRef } from "react";
import {
    TbArrowsDiagonal,
    TbArrowsDiagonalMinimize2,
    TbInfoCircle,
    TbTrash,
} from "react-icons/tb";
import { SliceInstruction } from "../../types";

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
            <Table.Td>{`${
                isBoolean(slice.optional) && slice.optional ? "Yes" : "No"
            }`}</Table.Td>
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
                    <VisuallyHidden>{`Remove slice-${slice.name}`}</VisuallyHidden>
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

                <Accordion.Panel style={{ overflow: "auto" }}>
                    <Table
                        horizontalSpacing="xl"
                        highlightOnHover
                        data-testid="batch-review-table"
                        styles={{ table: { width: "max-content" } }}
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
                                    Optional
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

interface SliceInstructionFieldsProps {
    onSliceInstructionsChange: (slices: SliceInstruction[]) => void;
    onSliceTargetChange: (sliceTarget: string | undefined) => void;
    isActive?: boolean;
}
interface FormValues {
    sliceTarget: string | null;
    sliceTargetChecked: boolean;
    slices: SliceInstruction[];
    sliceInput: {
        name: string;
        from: string;
        to: string;
        type: string;
        optional?: boolean;
    };
}

const nameValidation = (value: string, values: FormValues) => {
    if (isBlank(value)) return "Name is required!";

    if (
        values.slices.length > 0 &&
        any((slice) => slice.name === value, values.slices)
    ) {
        return `Duplicated name. Check review`;
    }

    return null;
};

const hasOverlap = (value: number, slices: SliceInstruction[]) =>
    any((slice) => {
        if (isNilOrEmpty(slice.to)) {
            return gte(value, slice.from);
        }

        return gt(value, slice.from) && lt(value, slice.to!);
    }, slices);

const fromValidation = (value: string, values: FormValues) => {
    if (isBlank(value)) return "From is required!";

    if (isNotNilOrEmpty(values.sliceInput.to) && value > values.sliceInput.to)
        return "From can't be bigger than To value.";

    const from = parseInt(value);

    if (values.slices.length > 0 && hasOverlap(from, values.slices)) {
        return "Overlap with added entry! Check review.";
    }
    return null;
};

const toValidation = (value: string, values: FormValues) => {
    if (isBlank(value)) return null;

    if (
        isNotNilOrEmpty(values.sliceInput.from) &&
        value < values.sliceInput.from
    )
        return "To value can't be smaller than From field.";

    const to = parseInt(value);

    if (values.slices.length > 0 && hasOverlap(to, values.slices)) {
        return "Overlap with added entry! Check review.";
    }
    return null;
};

const initialValues: FormValues = {
    sliceTarget: null,
    sliceTargetChecked: false,
    slices: [] as SliceInstruction[],
    sliceInput: {
        name: "",
        from: "",
        to: "",
        type: "",
        optional: false,
    },
};

export const byteSlicesFormActions =
    createFormActions<FormValues>("byte-slices-form");

const SliceInstructionFields: FC<SliceInstructionFieldsProps> = ({
    onSliceInstructionsChange,
    onSliceTargetChange,
}) => {
    const theme = useMantineTheme();
    const [expanded, { toggle }] = useDisclosure(true);
    const sliceNameRef = useRef<HTMLInputElement>(null);
    const form = useForm<FormValues>({
        name: "byte-slices-form",
        initialValues: clone(initialValues),
        validateInputOnChange: true,
        validate: {
            sliceInput: {
                name: nameValidation,
                from: fromValidation,
                to: toValidation,
            },
        },
    });

    const { slices, sliceInput, sliceTarget, sliceTargetChecked } =
        form.getTransformedValues();

    const sliceNames = slices.map((slice, idx) => slice.name ?? `slice-${idx}`);
    const key = JSON.stringify(slices);

    useEffect(() => {
        if (isFunction(onSliceInstructionsChange))
            onSliceInstructionsChange(clone(slices));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return (
        <Stack
            pl={{ base: 0, xs: "sm" }}
            data-testid="slice-instruction-fields"
        >
            <Fieldset p="xs">
                <Group justify="space-between">
                    <Text fw="bold">Define a slice</Text>
                    <Button
                        onClick={toggle}
                        size="compact-sm"
                        px="sm"
                        data-testid="byte-slice-form-resize"
                    >
                        {expanded ? (
                            <TbArrowsDiagonalMinimize2
                                size={theme?.other.iconSize ?? 21}
                            />
                        ) : (
                            <TbArrowsDiagonal
                                size={theme?.other.iconSize ?? 21}
                            />
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
                            placeholder="e.g. amount"
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
                            withAsterisk
                            placeholder="e.g. 0"
                            {...form.getInputProps("sliceInput.from")}
                        />
                        <NumberInput
                            allowNegative={false}
                            allowDecimal={false}
                            hideControls
                            data-testid="slice-to-input"
                            label="To"
                            description="Optional: Empty means from defined number until the end of the bytes."
                            placeholder="e.g. 20"
                            {...form.getInputProps("sliceInput.to")}
                        />
                        <TextInput
                            label="Type"
                            data-testid="slice-type-input"
                            placeholder="e.g. uint"
                            description="Optional: Empty means return slice value as-is (i.e. Hex.)"
                            {...form.getInputProps("sliceInput.type")}
                        />
                        <Group
                            justify="space-between"
                            align="normal"
                            wrap="nowrap"
                        >
                            <Stack gap={0}>
                                <Flex>
                                    <Text component="span" size="sm" mr={4}>
                                        Optional
                                    </Text>
                                    <Tooltip
                                        label="An optional boolean flag used to control the decoding behavior for the byte slice. When turned on, the decoder won't throw an exception caused by slicing the byte range, if that range is out of bounds (not found). Instead a fallback value of nil ('0x') will be used for that byte slice."
                                        multiline
                                        w={300}
                                    >
                                        <Text>
                                            <TbInfoCircle />
                                        </Text>
                                    </Tooltip>
                                </Flex>
                                <Text size="xs" c="dimmed" component="span">
                                    Signal to the decoder not to throw an
                                    exception caused by slicing the byte range.
                                </Text>
                            </Stack>
                            <Switch
                                data-testid="byte-slice-optional-switch"
                                {...form.getInputProps("sliceInput.optional")}
                                checked={
                                    form.getInputProps("sliceInput.optional")
                                        .value
                                }
                            />
                        </Group>
                    </Stack>
                    <Group justify="flex-end" mt="md">
                        <Button
                            size="sm"
                            disabled={!form.isValid("sliceInput")}
                            data-testid="slice-add-button"
                            onClick={() => {
                                const name = sliceInput.name;
                                const type = sliceInput.type as AbiType;
                                const from = parseInt(sliceInput?.from ?? "0");
                                const to =
                                    !isNil(sliceInput?.to) &&
                                    !isEmpty(sliceInput.to)
                                        ? parseInt(sliceInput?.to)
                                        : undefined;
                                const optional = sliceInput.optional;

                                const slice: SliceInstruction = {
                                    from,
                                    to,
                                    name,
                                    type,
                                    optional,
                                };

                                const newSlices = [...(slices ?? []), slice];

                                form.setFieldValue(
                                    "sliceInput",
                                    clone(initialValues.sliceInput),
                                );
                                form.setFieldValue("slices", newSlices);
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
                        data-testid="slice-apply-abi-on-checkbox"
                        checked={sliceTargetChecked}
                        onChange={() => {
                            form.setFieldValue(
                                "sliceTargetChecked",
                                !sliceTargetChecked,
                            );
                            if (sliceTarget !== null) {
                                form.setFieldValue("sliceTarget", null);
                                if (isFunction(onSliceTargetChange))
                                    onSliceTargetChange(undefined);
                            }
                        }}
                        label="Use ABI Parameter definition on"
                    />
                    <Select
                        name="slice"
                        data-testid="slice-select"
                        key={sliceNames.join(",")}
                        placeholder="Pick a slice"
                        data={sliceNames}
                        disabled={!sliceTargetChecked}
                        value={sliceTarget}
                        onChange={(value) => {
                            form.setFieldValue("sliceTarget", value);
                            if (isFunction(onSliceTargetChange))
                                onSliceTargetChange(value ?? undefined);
                        }}
                    />
                </Group>
            ) : (
                ""
            )}
        </Stack>
    );
};

interface ByteSlicesProps extends SliceInstructionFieldsProps {
    onSwitchChange: (active: boolean) => void;
    error?: string | ReactNode;
    isActive: boolean;
}

export const ByteSlices: FC<ByteSlicesProps> = ({
    onSliceInstructionsChange,
    onSliceTargetChange,
    onSwitchChange,
    error,
    isActive,
}) => {
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
                    {error && (
                        <Text c="red" size="xs">
                            {error}
                        </Text>
                    )}
                </Stack>
                <Switch
                    checked={isActive}
                    onClick={(evt) => {
                        const val = evt.currentTarget.checked;
                        onSwitchChange(val);
                        if (!val) {
                            onSliceInstructionsChange([]);
                            onSliceTargetChange(undefined);
                        }
                    }}
                    data-testid="add-byte-slice-switch"
                />
            </Group>

            {isActive ? (
                <SliceInstructionFields
                    onSliceInstructionsChange={onSliceInstructionsChange}
                    onSliceTargetChange={onSliceTargetChange}
                />
            ) : (
                ""
            )}
        </Stack>
    );
};
