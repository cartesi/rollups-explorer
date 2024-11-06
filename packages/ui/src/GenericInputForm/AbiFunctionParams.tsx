import { useFormContext } from "./context";
import { Alert, Stack, Text, TextInput } from "@mantine/core";
import { TbAlertCircle } from "react-icons/tb";
import { FunctionParamLabel } from "./FunctionSignature";
import { Fragment } from "react";
import { TupleComponents } from "./TupleComponents";
import { AbiInputParam } from "./types";

export const AbiFunctionParams = () => {
    const form = useFormContext();
    const { abiFunction } = form.getTransformedValues();

    return (
        <>
            {abiFunction ? (
                <Stack>
                    {abiFunction.inputs.length > 0 ? (
                        <>
                            {abiFunction.inputs.map((input, index) => (
                                <Fragment key={`${input.name}-${input.type}`}>
                                    {input.type === "tuple" ? (
                                        <TupleComponents
                                            input={input as AbiInputParam}
                                        />
                                    ) : (
                                        <TextInput
                                            key={`${input.name}-${input.type}`}
                                            label={
                                                input.name && input.type ? (
                                                    <FunctionParamLabel
                                                        input={input}
                                                    />
                                                ) : (
                                                    input.name || input.type
                                                )
                                            }
                                            placeholder={`Enter ${input.type} value`}
                                            withAsterisk
                                            {...form.getInputProps(
                                                `abiFunctionParams.${index}.value`,
                                            )}
                                        />
                                    )}
                                </Fragment>
                            ))}
                        </>
                    ) : (
                        <Alert
                            variant="light"
                            color="blue"
                            icon={<TbAlertCircle />}
                            data-testid="empty-inputs-argments-alert"
                        >
                            No input arguments defined for{" "}
                            <Text span fz="sm" fw="bold">
                                {abiFunction.name}()
                            </Text>
                            .
                        </Alert>
                    )}
                </Stack>
            ) : null}
        </>
    );
};
