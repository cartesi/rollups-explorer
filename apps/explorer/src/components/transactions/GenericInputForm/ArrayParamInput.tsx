"use client";
import {
    ActionIcon,
    Button,
    Fieldset,
    Group,
    Input,
    type InputWrapperProps,
    Stack,
    TextInput,
} from "@mantine/core";
import { type FC, useId } from "react";
import { TbPlus, TbTrash } from "react-icons/tb";
import {
    generateEmptyValue,
    getArrayItemParam,
    getParamValueErrors,
    type ParamValueError,
    parseArrayType,
} from "./abiParamValue";
import { useFormContext } from "./context";
import { InputLabel } from "./FunctionSignature";
import type { AbiParamShape, AbiParamValue } from "./types";

interface ParamInputProps {
    param: AbiParamShape;
    label: string;
    position?: string;
    path: string;
    rootPath: string;
    errors?: ParamValueError[];
}

const getOwnError = (errors: ParamValueError[], position: string) =>
    errors.find((error) => error.position === position)?.message;

const ParamValueInput: FC<ParamInputProps> = ({
    param,
    label,
    position = "",
    path,
    rootPath,
    errors = [],
}) => {
    const form = useFormContext();

    if (parseArrayType(param.type)) {
        return (
            <ArrayParamInput
                param={param}
                label={label}
                position={position}
                path={path}
                rootPath={rootPath}
                errors={errors}
            />
        );
    }

    if (param.type === "tuple") {
        return (
            <Fieldset
                legend={
                    <InputLabel
                        input={{ ...param, name: param.name || label }}
                    />
                }
            >
                <Stack>
                    {(param.components ?? []).map((component, index) => (
                        <ParamValueInput
                            key={index}
                            param={component}
                            label={`${label}.${component.name || index}`}
                            position={`${position}.${component.name || index}`}
                            path={`${path}.${index}`}
                            rootPath={rootPath}
                            errors={errors}
                        />
                    ))}
                </Stack>
            </Fieldset>
        );
    }

    const { value, onChange, onFocus } = form.getInputProps(path);
    const error =
        form.errors[rootPath] && form.isTouched(path)
            ? getOwnError(errors, position)
            : undefined;

    return (
        <TextInput
            label={param.name ? <InputLabel input={param} /> : undefined}
            aria-label={
                param.name ? `${param.type} ${param.name}, ${label}` : label
            }
            required={param.type !== "string"}
            error={error}
            placeholder={`Enter ${param.type} value`}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={() => form.validateField(rootPath)}
        />
    );
};

interface ArrayParamInputProps
    extends ParamInputProps, Pick<InputWrapperProps, "mt"> {}

export const ArrayParamInput: FC<ArrayParamInputProps> = ({
    param,
    label,
    position = "",
    path,
    rootPath,
    errors,
    mt,
}) => {
    const form = useFormContext();
    const labelId = useId();
    const isDynamic = parseArrayType(param.type)?.length === undefined;
    const itemParam = getArrayItemParam(param);
    const items = (form.getInputProps(path).value ?? []) as AbiParamValue[];
    const itemErrors = errors ?? getParamValueErrors(param, items, position);
    const revalidate = () => {
        if (form.errors[rootPath]) {
            form.validateField(rootPath);
        }
    };

    return (
        <Input.Wrapper
            role="group"
            aria-labelledby={labelId}
            labelElement="div"
            labelProps={{ id: labelId }}
            label={
                <InputLabel input={{ ...param, name: param.name || label }} />
            }
            withAsterisk={path === rootPath && !isDynamic}
            error={
                form.errors[rootPath]
                    ? getOwnError(itemErrors, position)
                    : undefined
            }
            mt={mt}
        >
            <Stack gap="xs" mt={4} mb={path === rootPath ? 5 : 0}>
                {items.map((_, index) => (
                    <Group
                        key={index}
                        gap="xs"
                        align="flex-start"
                        wrap="nowrap"
                    >
                        <Stack flex={1}>
                            <ParamValueInput
                                param={itemParam}
                                label={`${label}[${index}]`}
                                position={`${position}[${index}]`}
                                path={`${path}.${index}`}
                                rootPath={rootPath}
                                errors={itemErrors}
                            />
                        </Stack>
                        {isDynamic && (
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                size="lg"
                                aria-label={`Remove ${label}[${index}]`}
                                onClick={() => {
                                    form.removeListItem(path, index);
                                    revalidate();
                                }}
                            >
                                <TbTrash />
                            </ActionIcon>
                        )}
                    </Group>
                ))}
                {isDynamic && (
                    <Group>
                        <Button
                            variant="light"
                            size="xs"
                            leftSection={<TbPlus />}
                            aria-label={`Add item to ${label}`}
                            onClick={() => {
                                form.insertListItem(
                                    path,
                                    generateEmptyValue(itemParam),
                                );
                                revalidate();
                            }}
                        >
                            Add {itemParam.type} item
                        </Button>
                    </Group>
                )}
            </Stack>
        </Input.Wrapper>
    );
};
