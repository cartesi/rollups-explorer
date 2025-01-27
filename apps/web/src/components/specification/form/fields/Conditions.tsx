import {
    ActionIcon,
    Button,
    Group,
    SegmentedControl,
    SegmentedControlItem,
    Select,
    SimpleGrid,
    Stack,
    Switch,
    Text,
    TextInput,
} from "@mantine/core";
import { createFormActions, useForm } from "@mantine/form";
import { clone } from "ramda";
import { isBlank, isFunction } from "ramda-adjunct";
import { FC, ReactNode, useEffect } from "react";
import { TbTrash } from "react-icons/tb";
import LabelWithTooltip from "../../../labelWithTooltip";
import {
    Condition,
    ConditionalOperator,
    Predicate,
    inputProperties,
    logicalOperators,
    operators,
} from "../../types";

const ToLabel: FC = () => (
    <LabelWithTooltip
        label="To"
        tooltipLabel="A string comparison will be used. No special treatment is applied e.g. Lowercase / Uppercase"
    />
);

const initialCondition: Condition = {
    field: "application.address",
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
interface ConditionsFormValues {
    conditions: Condition[];
    logicalOperator: ConditionalOperator;
}

export const conditionsFormActions =
    createFormActions<ConditionsFormValues>("conditions-form");

export const AddConditions: FC<AddConditionsProps> = ({
    onConditionalsChange,
}) => {
    const form = useForm<ConditionsFormValues>({
        name: "conditions-form",
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

    const isValid = form.isValid();
    const { conditions, logicalOperator } = form.getTransformedValues();
    const numberOfConditions = conditions.length;

    useEffect(() => {
        const predicates: Predicate[] = [];
        if (isValid) {
            predicates.push({
                conditions: clone(conditions),
                logicalOperator: logicalOperator,
            });
        }

        if (isFunction(onConditionalsChange)) onConditionalsChange(predicates);
    }, [isValid, conditions, logicalOperator, onConditionalsChange]);

    return (
        <Stack gap="xs">
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

interface Props {
    onConditionalsChange: (conditionals: Predicate[]) => void;
    onSwitchChange: (active: boolean) => void;
    error?: string | ReactNode;
    isActive?: boolean;
}

export const Conditions: FC<Props> = ({
    onConditionalsChange,
    onSwitchChange,
    error,
    isActive,
}) => {
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
                    {error && (
                        <Text c="red" size="xs">
                            {error}
                        </Text>
                    )}
                </Stack>
                <Switch
                    data-testid="add-conditionals-switch"
                    checked={isActive}
                    onClick={(evt) => {
                        const val = evt.currentTarget.checked;
                        onSwitchChange(val);
                        if (!val) {
                            onConditionalsChange([]);
                        }
                    }}
                />
            </Group>
            {isActive ? (
                <AddConditions onConditionalsChange={onConditionalsChange} />
            ) : (
                ""
            )}
        </Stack>
    );
};
