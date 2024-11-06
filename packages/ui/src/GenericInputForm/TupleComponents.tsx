import React, { FC, Fragment } from "react";
import { InputLabel } from "./FunctionSignature";
import { Fieldset, FieldsetProps, TextInput } from "@mantine/core";
import { useFormContext } from "./context";
import { AbiInputParam } from "./types";

interface TupleComponentsProps extends FieldsetProps {
    input: AbiInputParam;
}

export const TupleComponents: FC<TupleComponentsProps> = (props) => {
    const form = useFormContext();
    const { input, ...restProps } = props;
    const { value: abiFunctionParams } =
        form.getInputProps("abiFunctionParams");
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
                const targetIndex = abiFunctionParams.findIndex(
                    (p: AbiInputParam) =>
                        p.tupleName === input.name &&
                        p.type === component.type &&
                        p.name === component.name,
                );

                return (
                    <Fragment
                        key={`${input.name}-${input.type}-${component.name}-${component.type}`}
                    >
                        {component.type === "tuple" ? (
                            <TupleComponents input={component} mt={16} />
                        ) : (
                            <TextInput
                                key={`${component.name}-${component.type}`}
                                label={<InputLabel input={component} />}
                                placeholder={`Enter ${component.type} value`}
                                mt={isFirstStandardInput ? 0 : 16}
                                withAsterisk
                                {...form.getInputProps(
                                    `abiFunctionParams.${targetIndex}.value`,
                                )}
                            />
                        )}
                    </Fragment>
                );
            })}
        </Fieldset>
    );
};
