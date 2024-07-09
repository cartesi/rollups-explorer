import {
    ActionIcon,
    Button,
    Flex,
    Group,
    SegmentedControl,
    SegmentedControlItem,
    Select,
    SimpleGrid,
    Stack,
    Switch,
    Text,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { clone } from "ramda";
import { isBlank, isFunction } from "ramda-adjunct";
import { FC, useEffect, useState } from "react";
import { TbHelp, TbTrash } from "react-icons/tb";
import { useSpecFormContext } from "../formContext";
import {
    Condition,
    ConditionalOperator,
    Predicate,
    inputProperties,
    logicalOperators,
    operators,
} from "../types";

const LabelWithTooltip: FC<{ label: string; tooltipLabel: string }> = ({
    label,
    tooltipLabel,
}) => {
    return (
        <Group justify="flex-start" gap="3">
            <Text size="sm">{label}</Text>
            <Tooltip multiline label={tooltipLabel}>
                <Flex direction="column-reverse">
                    <TbHelp />
                </Flex>
            </Tooltip>
        </Group>
    );
};

const ToLabel: FC = () => (
    <LabelWithTooltip
        label="To"
        tooltipLabel="A string comparison will be used. No special treatment is applied e.g. Lowercase / Uppercase"
    />
);

const initialCondition: Condition = {
    field: "application.id",
    operator: "equals",
    value: "",
};

const initialValues = {
    conditions: [initialCondition] as Condition[],
    logicalOperator: "or" as ConditionalOperator,
};

const logicalOps: SegmentedControlItem[] = clone(logicalOperators);

const LIMITS = {
    debounce_time: 500,
    max_conditions: 2,
} as const;

interface AddConditionsProps {
    onConditionalsChange: (conditionals: Predicate[]) => void;
}

export const AddConditions: FC<AddConditionsProps> = ({
    onConditionalsChange,
}) => {
    const form = useForm({
        validateInputOnChange: true,
        initialValues: clone(initialValues),
        validate: {
            conditions: {
                field: (value) => {
                    return isBlank(value) ? "The value is required!" : null;
                },
                value: (value) => {
                    return isBlank(value) ? "The value is required!" : null;
                },
            },
        },
    });
    const formValues = form.getTransformedValues();
    const [debouncedFormValues] = useDebouncedValue(
        formValues,
        LIMITS.debounce_time,
    );
    const [isValid] = useDebouncedValue(form.isValid(), LIMITS.debounce_time);

    const { conditions } = formValues;
    const numberOfConditions = conditions.length;

    useEffect(() => {
        const predicates: Predicate[] = [];
        if (isValid) {
            predicates.push({
                conditions: clone(debouncedFormValues.conditions),
                logicalOperator: debouncedFormValues.logicalOperator,
            });
        }

        if (isFunction(onConditionalsChange)) onConditionalsChange(predicates);
    }, [debouncedFormValues, isValid]);

    return (
        <Stack>
            {conditions.map((cond, idx) => (
                <Stack key={idx}>
                    {idx > 0 ? (
                        <SegmentedControl
                            data={logicalOps}
                            {...form.getInputProps("logicalOperator")}
                        />
                    ) : (
                        ""
                    )}
                    <SimpleGrid cols={{ base: 1, sm: 3 }}>
                        <Select
                            data-testid="conditionals-when-select"
                            defaultValue={cond.field}
                            data={inputProperties}
                            placeholder="Pick an input property"
                            label="When"
                            allowDeselect={false}
                            {...form.getInputProps(`conditions.${idx}.field`)}
                        />
                        <Select
                            data-testid="conditionals-is-select"
                            readOnly={operators.length === 1}
                            defaultValue={
                                operators.length === 1
                                    ? operators[0].value
                                    : null
                            }
                            data={operators}
                            label="is"
                            allowDeselect={false}
                            {...form.getInputProps(
                                `conditions.${idx}.operator`,
                            )}
                        />
                        <TextInput
                            data-testid="conditionals-to-input"
                            label={<ToLabel />}
                            {...form.getInputProps(`conditions.${idx}.value`)}
                            rightSection={
                                idx >= 1 ? (
                                    <ActionIcon
                                        data-testid={`conditionals-remove-${idx}-button`}
                                        variant="transparent"
                                        color="red"
                                        onClick={() => {
                                            form.removeListItem(
                                                "conditions",
                                                idx,
                                            );
                                        }}
                                    >
                                        <TbTrash />
                                    </ActionIcon>
                                ) : (
                                    ""
                                )
                            }
                        />
                    </SimpleGrid>
                </Stack>
            ))}
            <Group justify="flex-end">
                <Button
                    data-testid="conditionals-add-button"
                    disabled={numberOfConditions === LIMITS.max_conditions}
                    onClick={() => {
                        if (numberOfConditions < LIMITS.max_conditions) {
                            form.insertListItem(
                                "conditions",
                                clone(initialCondition),
                            );
                        }
                    }}
                >
                    Add ({LIMITS.max_conditions - numberOfConditions})
                </Button>
            </Group>
        </Stack>
    );
};

export const Conditions: FC = () => {
    const [checked, setChecked] = useState(false);
    const form = useSpecFormContext();

    return (
        <Stack>
            <Group justify="space-between" align="normal" wrap="nowrap">
                <Stack gap={0}>
                    <Text component="span" fw="bold">
                        Add Conditions
                    </Text>
                    <Text size="xs" c="dimmed" component="span">
                        Conditionals are to auto-apply the specification on an
                        input.
                    </Text>
                </Stack>
                <Switch
                    data-testid="add-conditionals-switch"
                    checked={checked}
                    onClick={(evt) => {
                        const val = evt.currentTarget.checked;
                        setChecked(val);
                        if (!val) {
                            form.setFieldValue("conditionals", []);
                        }
                    }}
                />
            </Group>
            {checked ? (
                <Stack pl="sm">
                    <AddConditions
                        onConditionalsChange={(conditionals) => {
                            form.setFieldValue("conditionals", conditionals);
                        }}
                    />
                </Stack>
            ) : (
                ""
            )}
        </Stack>
    );
};
