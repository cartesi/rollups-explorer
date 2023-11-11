import { FC, useEffect, useMemo } from "react";
import {
    useInputBoxAddInput,
    usePrepareInputBoxAddInput,
} from "@cartesi/rollups-wagmi";
import {
    Alert,
    Autocomplete,
    Button,
    Collapse,
    Group,
    Loader,
    Stack,
    Text,
    TextInput,
    Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { TbAlertCircle, TbCheck } from "react-icons/tb";
import {
    BaseError,
    getAddress,
    isAddress,
    isHex,
    parseUnits,
    toHex,
    zeroAddress,
} from "viem";
import { useWaitForTransaction } from "wagmi";
import { cacheExchange, fetchExchange } from "@urql/core";
import { withUrqlClient } from "next-urql";
import { useApplicationsQuery } from "web/src/graphql";
import { TransactionProgress } from "./TransactionProgress";

export interface RawInputFormProps {
    applications: string[];
    isLoadingApplications: boolean;
    onSearchApplications: (applicationId: string) => void;
}

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
        // eslint-disable-next-line
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
                    rightSection={
                        (isLoadingApplications || prepare.isLoading) && (
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
                    value={rawInput}
                    error={isHex(rawInput) ? undefined : "Invalid hex string"}
                    withAsterisk
                    onChange={(e) => setRawInput(e.target.value)}
                />

                <Collapse in={addInput.isLoading || addInputWait.isLoading}>
                    <TransactionProgress
                        prepare={addInput}
                        execute={addInput}
                        wait={addInputWait}
                        confirmationMessage="Raw input sent successfully!"
                    />
                </Collapse>

                <Group justify="right">
                    <Button
                        variant="filled"
                        disabled={!canSubmitInput}
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
});
