import { useFormContext } from "./context";
import { Alert, Stack, Text, TextInput } from "@mantine/core";
import { TbAlertCircle } from "react-icons/tb";
import { InputLabel } from "./FunctionSignature";
import { Fragment } from "react";
import { TupleComponents } from "./TupleComponents";
import { AbiInputParam } from "./types";

export const AbiFunctionParams = () => {
    const form = useFormContext();
    const { abiFunction } = form.getTransformedValues();
    const abiFunctionParams = form.getInputProps("abiFunctionParams");

    return (
        <>
            {abiFunction ? (
                <Stack>
                    {abiFunction.inputs.length > 0 ? (
                        <>
                            {abiFunction.inputs.map((input) => {
                                const inputIndex =
                                    abiFunctionParams.value.findIndex(
                                        (p: AbiInputParam) => p.id === input.id,
                                    );

                                return (
                                    <Fragment key={input.id}>
                                        {input.type === "tuple" ? (
                                            <TupleComponents
                                                input={input as AbiInputParam}
                                            />
                                        ) : (
                                            <TextInput
                                                label={
                                                    <InputLabel input={input} />
                                                }
                                                placeholder={`Enter ${input.type} value`}
                                                withAsterisk
                                                {...form.getInputProps(
                                                    `abiFunctionParams.${inputIndex}.value`,
                                                )}
                                            />
                                        )}
                                    </Fragment>
                                );
                            })}
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
