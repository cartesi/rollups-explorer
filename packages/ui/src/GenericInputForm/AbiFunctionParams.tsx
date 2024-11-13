import { useFormContext } from "./context";
import { Alert, Stack, Text, TextInput } from "@mantine/core";
import { TbAlertCircle } from "react-icons/tb";
import { InputLabel } from "./FunctionSignature";
import { Fragment } from "react";
import { TupleComponents } from "./TupleComponents";
import { AbiInputParam } from "./types";
import { getInputIndexOffset } from "./utils";

export const AbiFunctionParams = () => {
    const form = useFormContext();
    const { abiFunction } = form.getTransformedValues();

    return (
        <>
            {abiFunction ? (
                <Stack>
                    {abiFunction.inputs.length > 0 ? (
                        <>
                            {abiFunction.inputs.map((input, index) => {
                                const prevInputs = abiFunction.inputs.slice(
                                    0,
                                    index,
                                ) as AbiInputParam[];
                                const indexOffset =
                                    getInputIndexOffset(prevInputs);

                                return (
                                    <Fragment
                                        key={`${input.name}-${input.type}`}
                                    >
                                        {input.type === "tuple" ? (
                                            <TupleComponents
                                                input={input as AbiInputParam}
                                            />
                                        ) : (
                                            <TextInput
                                                key={`${input.name}-${input.type}`}
                                                label={
                                                    <InputLabel input={input} />
                                                }
                                                placeholder={`Enter ${input.type} value`}
                                                withAsterisk
                                                {...form.getInputProps(
                                                    `abiFunctionParams.${indexOffset}.value`,
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
