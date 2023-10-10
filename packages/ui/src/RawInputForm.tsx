import { FC, useEffect, useMemo } from "react";
import {
    useInputBoxAddInput,
    usePrepareInputBoxAddInput,
} from "@cartesi/rollups-wagmi";
import {
    Button,
    Collapse,
    Group,
    Loader,
    Stack,
    Text,
    TextInput,
    Textarea,
    Autocomplete,
    Alert,
} from "@mantine/core";
import { FC, useEffect, useState } from "react";
import { TbCheck } from "react-icons/tb";
import {
    BaseError,
    formatUnits,
    getAddress,
    isAddress,
    isHex,
    parseUnits,
    toHex,
} from "viem";
import { useWaitForTransaction } from "wagmi";
import { cacheExchange, fetchExchange } from "@urql/core";
import { withUrqlClient } from "next-urql";
import { useApplicationsQuery } from "web/src/graphql";
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

    const addInput = useInputBoxAddInput({
        args: [
            application as `0x${string}`, // isAddress(application) ? getAddress(application) : "0x",
            rawInput as `0x${string}`,
        ],
    });
    const addInputWait = useWaitForTransaction(addInput.data);
    const canSubmitInput = application !== "" && isHex(rawInput);
    const { disabled, loading } = transactionButtonState(
        addInput,
        addInputWait,
        addInput.write,
        false,
    );

    return (
        <form>
            <Stack>
                <ApplicationAutocomplete
                    application={application}
                    applications={applications}
                    onChange={setApplication}
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
