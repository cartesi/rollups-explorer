import {
    ActionIcon,
    Button,
    Card,
    Group,
    Stack,
    Text,
    TextInput,
    VisuallyHidden,
} from "@mantine/core";
import { createFormActions, useForm } from "@mantine/form";
import { clone } from "ramda";
import { isFunction, isNilOrEmpty, isNotNilOrEmpty } from "ramda-adjunct";
import { type FC, type ReactNode, useEffect, useRef } from "react";
import { TbTrash } from "react-icons/tb";
import { parseAbiParameters } from "viem";

const checkError = (entries: string[]) => {
    try {
        parseAbiParameters(entries);
        return null;
    } catch (error: unknown) {
        return error as Error;
    }
};

interface FormValues {
    entries: string[];
    abiParamEntry: string;
}
interface HumanReadableABIParameter {
    error?: string | ReactNode;
    onAbiParamsChange: (abiParams: string[]) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const humanReadableABIParameterFormActions =
    createFormActions<FormValues>("human-readable-abi-parameter-form");

export const HumanReadableABIParameter: FC<HumanReadableABIParameter> = (
    props,
) => {
    const form = useForm<FormValues>({
        name: "human-readable-abi-parameter-form",
        initialValues: {
            abiParamEntry: "",
            entries: [],
        },
    });

    const ref = useRef<HTMLInputElement>(null);
    const { entries, abiParamEntry } = form.getTransformedValues();
    const error = isNotNilOrEmpty(entries) ? checkError(entries) : null;
    const onAbiParamsChange = props.onAbiParamsChange;

    const addABIParam = () => {
        if (isNotNilOrEmpty(abiParamEntry)) {
            form.insertListItem("entries", clone(abiParamEntry));
            form.setFieldValue("abiParamEntry", "");
            ref.current?.focus();
        }
    };

    const removeABIParam = (index: number) => {
        form.removeListItem("entries", index);
        ref.current?.focus();
    };

    useEffect(() => {
        if (isFunction(onAbiParamsChange)) onAbiParamsChange([...entries]);
    }, [entries, onAbiParamsChange]);

    return (
        <Stack>
            <TextInput
                ref={ref}
                label="ABI Parameter"
                description="Human readable ABI format"
                placeholder="address to, uint256 amount, bool succ"
                rightSectionWidth="lg"
                {...form.getInputProps("abiParamEntry")}
                rightSection={
                    <Button
                        data-testid="abi-parameter-add-button"
                        onClick={addABIParam}
                    >
                        Add
                    </Button>
                }
                error={isNilOrEmpty(entries) ? props.error : null}
            />

            {entries.length > 0 && (
                <Stack gap="xs" pl="sm">
                    {entries.map((entry, idx) => (
                        <Card
                            key={idx}
                            p="xs"
                            style={{ borderColor: error ? "red" : "" }}
                        >
                            <Group
                                justify="space-between"
                                align="center"
                                wrap="nowrap"
                            >
                                <Text fw="bold" pl="sm">
                                    {entry}
                                </Text>
                                <ActionIcon
                                    variant="transparent"
                                    color="red"
                                    onClick={() => removeABIParam(idx)}
                                >
                                    <VisuallyHidden>
                                        Remove abi parameter {entry}
                                    </VisuallyHidden>
                                    <TbTrash size={21} />
                                </ActionIcon>
                            </Group>
                        </Card>
                    ))}
                    {error && <Text c="red">{error.message}</Text>}
                </Stack>
            )}
        </Stack>
    );
};
