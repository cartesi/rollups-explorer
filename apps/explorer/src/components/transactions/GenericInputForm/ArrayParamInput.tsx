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
import { type FC } from "react";
import { TbPlus, TbTrash } from "react-icons/tb";
import { useFormContext } from "./context";
import { InputLabel } from "./FunctionSignature";
import type { AbiParamShape, AbiParamValue } from "./types";
import { generateEmptyValue, getArrayItemParam, parseArrayType } from "./utils";

interface ParamInputProps {
    param: AbiParamShape;
    path: string;
    rootPath: string;
}

const ParamValueInput: FC<ParamInputProps> = ({ param, path, rootPath }) => {
    const form = useFormContext();

    if (parseArrayType(param.type)) {
        return (
            <ArrayParamInput param={param} path={path} rootPath={rootPath} />
        );
    }

    if (param.type === "tuple") {
        return (
            <Fieldset legend={<InputLabel input={param} />}>
                <Stack>
                    {(param.components ?? []).map((component, index) => (
                        <ParamValueInput
                            key={index}
                            param={component}
                            path={`${path}.${index}`}
                            rootPath={rootPath}
                        />
                    ))}
                </Stack>
            </Fieldset>
        );
    }

    const { value, onChange } = form.getInputProps(path);

    return (
        <TextInput
            label={param.name ? <InputLabel input={param} /> : undefined}
            placeholder={`Enter ${param.type} value`}
            value={value}
            onChange={onChange}
            onBlur={() => form.validateField(rootPath)}
        />
    );
};

interface ArrayParamInputProps
    extends ParamInputProps, Pick<InputWrapperProps, "mt"> {}

export const ArrayParamInput: FC<ArrayParamInputProps> = ({
    param,
    path,
    rootPath,
    mt,
}) => {
    const form = useFormContext();
    const isDynamic = parseArrayType(param.type)?.length === undefined;
    const itemParam = getArrayItemParam(param);
    const items = (form.getInputProps(path).value ?? []) as AbiParamValue[];
    const revalidate = () => {
        if (form.errors[rootPath]) {
            form.validateField(rootPath);
        }
    };

    return (
        <Input.Wrapper
            label={<InputLabel input={param} />}
            withAsterisk={path === rootPath}
            error={path === rootPath ? form.errors[rootPath] : undefined}
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
                                path={`${path}.${index}`}
                                rootPath={rootPath}
                            />
                        </Stack>
                        {isDynamic && (
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                size="lg"
                                aria-label={`Remove ${param.type} item ${index}`}
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
