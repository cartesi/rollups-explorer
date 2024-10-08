import { useFormContext } from "./context";
import {
    Alert,
    Box,
    Combobox,
    Input,
    InputBase,
    Select,
    Stack,
    Text,
    TextInput,
    useCombobox,
} from "@mantine/core";
import { AbiFunction, AbiParameter } from "viem";
import { FC, Fragment } from "react";
import { FormSpecification } from "./types";
import { TbAlertCircle } from "react-icons/tb";

interface FunctionParamProps {
    input: AbiParameter;
}

export const FunctionParam: FC<FunctionParamProps> = ({ input }) => {
    return (
        <Box display="inline">
            <Text c="cyan" span fz="sm">
                {input.type}
            </Text>{" "}
            <Text span fz="sm">
                {input.name}
            </Text>
        </Box>
    );
};

interface FunctionSignatureProps {
    abiFunction: AbiFunction;
}

export const FunctionSignature: FC<FunctionSignatureProps> = ({
    abiFunction,
}) => {
    return (
        <>
            <Text span fw="bold" fz="sm">
                {abiFunction.name}
            </Text>
            (
            {abiFunction.inputs.map((input, index) => (
                <Fragment key={`${input.type}-${input.name}`}>
                    <FunctionParam input={input} />
                    {index < abiFunction.inputs.length - 1 ? ", " : ""}
                </Fragment>
            ))}
            )
        </>
    );
};

export interface AbiFieldsProps {
    specifications: FormSpecification[];
}

export const AbiFields: FC<AbiFieldsProps> = ({ specifications }) => {
    const form = useFormContext();
    const { abiMethod, abiFunction, selectedSpecification } =
        form.getTransformedValues();
    const specificationOptions = specifications.map((s) => ({
        value: s.id,
        label: s.name,
    }));

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    return (
        <Stack>
            <Select
                label="ABI method"
                description="Select how to attach an ABI"
                mb={16}
                allowDeselect={false}
                withAsterisk
                data={[
                    {
                        value: "existing",
                        label: "ABI from an existing JSON_ABI specification",
                    },
                    { value: "new", label: "New ABI" },
                ]}
                {...form.getInputProps("abiMethod")}
            />

            {abiMethod === "existing" ? (
                <Select
                    label="Specifications"
                    description="Available JSON_ABI specifications"
                    placeholder="Select specification"
                    data={specificationOptions}
                    allowDeselect={false}
                    withAsterisk
                    {...form.getInputProps("specificationId")}
                />
            ) : null}

            {selectedSpecification && (
                <Combobox
                    store={combobox}
                    onOptionSubmit={(abiFunctionName) => {
                        combobox.closeDropdown();
                        form.setFieldValue("abiFunctionName", abiFunctionName);
                    }}
                >
                    <Combobox.Target>
                        <InputBase
                            component="button"
                            type="button"
                            pointer
                            label="ABI Function"
                            description="Available ABI functions"
                            rightSection={<Combobox.Chevron />}
                            rightSectionPointerEvents="none"
                            withAsterisk
                            {...form.getInputProps("abiFunctionName")}
                            onClick={() => combobox.toggleDropdown()}
                        >
                            {abiFunction ? (
                                <FunctionSignature abiFunction={abiFunction} />
                            ) : (
                                <Input.Placeholder>
                                    Select function
                                </Input.Placeholder>
                            )}
                        </InputBase>
                    </Combobox.Target>
                    <Combobox.Dropdown>
                        <Combobox.Options>
                            {(selectedSpecification.abi as AbiFunction[])
                                .filter((item) => item.type === "function")
                                .map((abiFunction) => {
                                    const params = abiFunction.inputs
                                        .map(
                                            (input) =>
                                                `${input.type} ${input.name}`,
                                        )
                                        .join(", ");

                                    return (
                                        <Combobox.Option
                                            key={`${abiFunction.name}-${params}`}
                                            value={abiFunction.name}
                                        >
                                            <FunctionSignature
                                                abiFunction={abiFunction}
                                            />
                                        </Combobox.Option>
                                    );
                                })}
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>
            )}

            {abiFunction && (
                <Stack>
                    {abiFunction.inputs.length > 0 ? (
                        <>
                            {abiFunction.inputs.map((input) => (
                                <TextInput
                                    key={`${input.name}-${input.type}`}
                                    label={
                                        input.name && input.type ? (
                                            <FunctionParam input={input} />
                                        ) : (
                                            input.name || input.type
                                        )
                                    }
                                    placeholder="Enter value"
                                    withAsterisk
                                />
                            ))}
                        </>
                    ) : (
                        <Alert
                            variant="light"
                            color="blue"
                            icon={<TbAlertCircle />}
                            data-testid={`specification-mode-info`}
                        >
                            No input arguments defined for{" "}
                            <Text span fz="sm" fw="bold">
                                {abiFunction.name}()
                            </Text>
                            .
                        </Alert>
                    )}
                </Stack>
            )}
        </Stack>
    );
};
