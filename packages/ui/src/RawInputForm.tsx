import { FC, useEffect, useMemo } from "react";
import {
    useInputBoxAddInput,
    usePrepareInputBoxAddInput,
} from "@cartesi/rollups-wagmi";
import {
    Button,
    Collapse,
    Group,
    Stack,
    Textarea,
    Autocomplete,
    Alert,
    Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { TbCheck, TbAlertCircle } from "react-icons/tb";
import {
    getAddress,
    isAddress,
    isHex,
    toHex,
    zeroAddress,
    BaseError,
} from "viem";
import { useWaitForTransaction } from "wagmi";
import { TransactionProgress } from "./TransactionProgress";

export interface RawInputFormProps {
    applications: string[];
}

export const RawInputForm: FC<RawInputFormProps> = ({ applications }) => {
    const addresses = useMemo(
        () => applications.map(getAddress),
        [applications],
    );
    const form = useForm({
        validateInputOnBlur: true,
        initialValues: {
            application: "",
            rawInput: "0x",
        },
        validate: {
            application: (value) =>
                value !== "" && isAddress(value) ? null : "Invalid application",
            rawInput: (value) => (isHex(value) ? null : "Invalid hex string"),
        },
        transformValues: (values) => ({
            address: isAddress(values.application)
                ? getAddress(values.application)
                : zeroAddress,
            rawInput: toHex(values.rawInput),
        }),
    });
    const { address, rawInput } = form.getTransformedValues();
    const prepare = usePrepareInputBoxAddInput({
        args: [address, rawInput],
        enabled: form.isValid(),
    });
    const execute = useInputBoxAddInput(prepare.config);
    const wait = useWaitForTransaction(execute.data);
    const loading = execute.status === "loading" || wait.status === "loading";
    const canSubmit = form.isValid() && prepare.error === null;

    useEffect(() => {
        if (wait.status === "success") {
            form.reset();
        }
    }, [wait.status]);

    return (
        <form>
            <Stack>
                <Autocomplete
                    label="Application"
                    description="The application smart contract address"
                    placeholder="0x"
                    data={applications}
                    withAsterisk
                    rightSection={prepare.isLoading && <Loader size="xs" />}
                    {...form.getInputProps("application")}
                    error={
                        form.errors.application ||
                        (prepare.error as BaseError)?.shortMessage
                    }
                />

                {!form.errors.application &&
                    address !== zeroAddress &&
                    !addresses.includes(address) && (
                        <Alert
                            variant="light"
                            color="yellow"
                            icon={<TbAlertCircle />}
                        >
                            This is an undeployed application.
                        </Alert>
                    )}

                <Textarea
                    label="Raw input"
                    description="Raw input for the application"
                    withAsterisk
                    {...form.getInputProps("rawInput")}
                />

                <Collapse
                    in={
                        execute.isLoading ||
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
                        onClick={execute.write}
                    >
                        Send
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
