import {
    useSimulateInputBoxAddInput,
    useWriteInputBoxAddInput,
} from "@cartesi/rollups-wagmi";
import {
    Alert,
    Autocomplete,
    Button,
    Collapse,
    Combobox,
    Group,
    InputBase,
    Input,
    Loader,
    SegmentedControl,
    Select,
    Stack,
    Textarea,
    useCombobox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FC, Fragment, useCallback, useEffect, useState } from "react";
import { TbAlertCircle, TbCheck } from "react-icons/tb";
import {
    Abi,
    AbiFunction,
    BaseError,
    getAddress,
    Hex,
    isAddress,
    isHex,
    stringToHex,
    zeroAddress,
} from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import { TransactionProgress } from "./TransactionProgress";
import useUndeployedApplication from "./hooks/useUndeployedApplication";
import { TransactionFormSuccessData } from "./DepositFormTypes";

type Format = "hex" | "string" | "abi";

export interface RawInputFormSpecification {
    id: string;
    name: string;
    abi: Abi;
}

export interface RawInputFormProps {
    applications: string[];
    specifications: RawInputFormSpecification[];
    isLoadingApplications: boolean;
    onSearchApplications: (applicationId: string) => void;
    onSuccess: (receipt: TransactionFormSuccessData) => void;
}

export const RawInputForm: FC<RawInputFormProps> = (props) => {
    const {
        applications,
        specifications,
        isLoadingApplications,
        onSearchApplications,
        onSuccess,
    } = props;
    const form = useForm({
        validateInputOnBlur: true,
        initialValues: {
            application: "",
            rawInput: "0x",
            stringInput: "",
            abiMethod: "existing",
            specificationId: "",
            abiFunctionName: "",
        },
        validate: {
            application: (value) =>
                value !== "" && isAddress(value) ? null : "Invalid application",
            rawInput: (value) => (isHex(value) ? null : "Invalid hex string"),
        },
        transformValues: (values) => {
            const selectedSpecification = specifications.find(
                (s) => s.id === values.specificationId,
            );
            return {
                address: isAddress(values.application)
                    ? getAddress(values.application)
                    : zeroAddress,
                rawInput: values.rawInput as Hex,
                abiMethod: values.abiMethod,
                specificationId: values.specificationId,
                selectedSpecification,
                abiFunction: (
                    (selectedSpecification?.abi as AbiFunction[]) ?? []
                ).find(
                    (abiFunction) =>
                        abiFunction.name === values.abiFunctionName,
                ),
            };
        },
    });
    const { address, rawInput, abiMethod, abiFunction, selectedSpecification } =
        form.getTransformedValues();
    const prepare = useSimulateInputBoxAddInput({
        args: [address, rawInput],
        query: {
            enabled: form.isValid(),
        },
    });

    const execute = useWriteInputBoxAddInput();
    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });
    const loading = execute.isPending || wait.isLoading;
    const canSubmit = form.isValid() && prepare.error === null;
    const isUndeployedApp = useUndeployedApplication(address, applications);
    const [format, setFormat] = useState<Format>("hex");
    const specificationOptions = specifications.map((s) => ({
        value: s.id,
        label: s.name,
    }));

    const onChangeFormat = useCallback((format: string | null) => {
        setFormat(format as Format);
    }, []);

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const formatParams = useCallback((abiFunction: AbiFunction) => {
        return abiFunction.inputs
            .map((input) => `${input.type} ${input.name}`)
            .join(", ");
    }, []);

    useEffect(() => {
        if (wait.isSuccess) {
            onSuccess({ receipt: wait.data, type: "RAW" });
            form.reset();
            execute.reset();
            onSearchApplications("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wait, onSearchApplications, onSuccess]);

    useEffect(() => {
        console.log("specifications::", specifications);
    }, [specifications]);

    return (
        <form data-testid="raw-input-form">
            <Stack>
                <Autocomplete
                    label="Application"
                    description="The application smart contract address"
                    placeholder="0x"
                    data={applications}
                    withAsterisk
                    rightSection={
                        (prepare.isLoading || isLoadingApplications) && (
                            <Loader size="xs" />
                        )
                    }
                    {...form.getInputProps("application")}
                    error={
                        form.errors.application ||
                        (prepare.error as BaseError)?.shortMessage
                    }
                    onChange={(nextValue) => {
                        form.setFieldValue("application", nextValue);
                        onSearchApplications(nextValue);
                    }}
                />

                {!form.errors.application && isUndeployedApp && (
                    <Alert
                        variant="light"
                        color="yellow"
                        icon={<TbAlertCircle />}
                    >
                        This is an undeployed application.
                    </Alert>
                )}

                <SegmentedControl
                    value={format}
                    onChange={onChangeFormat}
                    data={[
                        { label: "Hex", value: "hex" },
                        { label: "String to Hex", value: "string" },
                        { label: "ABI to Hex", value: "abi" },
                    ]}
                />

                {format === "hex" ? (
                    <Textarea
                        label="Raw input"
                        description="Raw input for the application"
                        withAsterisk
                        {...form.getInputProps("rawInput")}
                    />
                ) : format === "string" ? (
                    <>
                        <Textarea
                            label="String input"
                            description="String input for the application"
                            mb={16}
                            {...form.getInputProps("stringInput")}
                            onChange={(event) => {
                                const nextValue = event.target.value;
                                form.setFieldValue("stringInput", nextValue);

                                form.setFieldValue(
                                    "rawInput",
                                    stringToHex(nextValue),
                                );
                            }}
                        />

                        <Textarea
                            label="Hex value"
                            description="Encoded hex value for the application"
                            readOnly
                            {...form.getInputProps("rawInput")}
                        />
                    </>
                ) : format === "abi" ? (
                    <Stack>
                        <Select
                            label="ABI method"
                            description="Select how to attach an ABI"
                            mb={16}
                            allowDeselect={false}
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
                                placeholder="Select specification..."
                                data={specificationOptions}
                                withAsterisk
                                {...form.getInputProps("specificationId")}
                            />
                        ) : null}

                        {selectedSpecification && (
                            <Combobox
                                store={combobox}
                                onOptionSubmit={(abiFunctionName) => {
                                    combobox.closeDropdown();
                                    form.setFieldValue(
                                        "abiFunctionName",
                                        abiFunctionName,
                                    );
                                }}
                            >
                                <Combobox.Target>
                                    <InputBase
                                        component="button"
                                        type="button"
                                        pointer
                                        rightSection={<Combobox.Chevron />}
                                        rightSectionPointerEvents="none"
                                        onClick={() =>
                                            combobox.toggleDropdown()
                                        }
                                    >
                                        {abiFunction ? (
                                            `${abiFunction.name}(${formatParams(
                                                abiFunction,
                                            )})`
                                        ) : (
                                            <Input.Placeholder>
                                                Select function
                                            </Input.Placeholder>
                                        )}
                                    </InputBase>
                                </Combobox.Target>
                                <Combobox.Dropdown>
                                    <Combobox.Options>
                                        {(
                                            selectedSpecification.abi as AbiFunction[]
                                        )
                                            .filter(
                                                (item) =>
                                                    item.type === "function",
                                            )
                                            .map((abiFunction) => {
                                                const params =
                                                    abiFunction.inputs
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
                                                        {abiFunction.name}(
                                                        {abiFunction.inputs.map(
                                                            (input, index) => (
                                                                <Fragment
                                                                    key={`${input.type}-${input.name}`}
                                                                >
                                                                    <span>
                                                                        <span
                                                                            style={{
                                                                                color: "var(--mantine-color-blue-text)",
                                                                            }}
                                                                        >
                                                                            {
                                                                                input.type
                                                                            }
                                                                        </span>{" "}
                                                                        <span>
                                                                            {
                                                                                input.name
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                    {index <
                                                                    abiFunction
                                                                        .inputs
                                                                        .length -
                                                                        1
                                                                        ? ", "
                                                                        : ""}
                                                                </Fragment>
                                                            ),
                                                        )}
                                                        )
                                                    </Combobox.Option>
                                                );
                                            })}
                                    </Combobox.Options>
                                </Combobox.Dropdown>
                            </Combobox>
                        )}
                    </Stack>
                ) : null}

                <Collapse
                    in={
                        execute.isPending ||
                        wait.isLoading ||
                        execute.isSuccess ||
                        execute.isError
                    }
                >
                    <TransactionProgress
                        prepare={prepare}
                        execute={execute}
                        wait={wait}
                        confirmationMessage="Raw input sent successfully!"
                        defaultErrorMessage={execute.error?.message}
                    />
                </Collapse>

                <Group justify="right">
                    <Button
                        variant="filled"
                        disabled={!canSubmit}
                        leftSection={<TbCheck />}
                        loading={loading}
                        onClick={() =>
                            execute.writeContract(prepare.data!.request)
                        }
                    >
                        Send
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
