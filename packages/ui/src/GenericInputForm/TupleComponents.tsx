import React, { FC, Fragment } from "react";
import { InputLabel } from "./FunctionSignature";
import { Fieldset, FieldsetProps, TextInput } from "@mantine/core";
import { useFormContext } from "./context";
import { AbiInputParam } from "./types";

interface TupleComponentsProps extends FieldsetProps {
    input: AbiInputParam;
}

export const TupleComponents: FC<TupleComponentsProps> = (props) => {
    const { input, ...restProps } = props;
    const form = useFormContext();
    const abiFunctionParams = form.getInputProps("abiFunctionParams");
    const firstStandardInput = input.components.find((c) => c.type !== "tuple");
    const firstStandardInputIndex = input.components.findIndex(
        (c) =>
            c.name == firstStandardInput?.name &&
            c.type === firstStandardInput?.type,
    );

    return (
        <Fieldset {...restProps} legend={<InputLabel input={input} />}>
            {input.components.map((component, componentIndex) => {
                const isFirstStandardInput =
                    componentIndex === firstStandardInputIndex;
                const inputIndex = abiFunctionParams.value.findIndex(
                    (p: AbiInputParam) => p.id === component.id,
                );

                return (
                    <Fragment key={component.id}>
                        {component.type === "tuple" ? (
                            <TupleComponents
                                input={component}
                                mt={componentIndex > 0 ? 16 : 0}
                                mb={
                                    input.components[componentIndex + 1]
                                        ? 16
                                        : 0
                                }
                            />
                        ) : (
                            <TextInput
                                label={<InputLabel input={component} />}
                                placeholder={`Enter ${component.type} value`}
                                mt={isFirstStandardInput ? 0 : 16}
                                withAsterisk
                                {...form.getInputProps(
                                    `abiFunctionParams.${inputIndex}.value`,
                                )}
                            />
                        )}
                    </Fragment>
                );
            })}
        </Fieldset>
    );
};
