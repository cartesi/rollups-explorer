import { useInputBoxAddInput } from "@cartesi/rollups-wagmi";
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
import { useAccount, useContractReads, useWaitForTransaction } from "wagmi";
import { TransactionStageStatus } from "./TransactionStatus";
import { TransactionProgress } from "./TransactionProgress";

export const transactionButtonState = (
    execute: TransactionStageStatus,
    wait: TransactionStageStatus,
    write?: () => void,
    disableOnSuccess: boolean = true,
) => {
    const loading = execute.status === "loading" || wait.status === "loading";

    const disabled =
        execute.error != null ||
        (disableOnSuccess && wait.status === "success") ||
        !write;

    return { loading, disabled };
};

export interface ApplicationAutocompleteProps {
    applications: string[];
    application: string;
    onChange: (application: string) => void;
}
export const ApplicationAutocomplete: FC<ApplicationAutocompleteProps> = (
    props,
) => {
    const { applications, application, onChange } = props;

    return (
        <>
            <Autocomplete
                label="Application"
                description="The application smart contract address"
                placeholder="0x"
                data={applications}
                value={application}
                withAsterisk
                onChange={onChange}
            />

            {application !== "" && !applications.includes(application) && (
                <Alert variant="light" color="blue">
                    This is a deposit to an undeployed application.
                </Alert>
            )}
        </>
    );
};

export interface RawInputFormProps {
    applications: string[];
}

export const RawInputForm: FC<RawInputFormProps> = (props) => {
    const { applications } = props;
    const { address } = useAccount();
    const [rawInput, setRawInput] = useState<string>("0x");
    const [application, setApplication] = useState("");

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
                        onClick={() => {
                            addInput.write({ data: rawInput as `0x${string}` });
                            // addInput.write();
                        }}
                    >
                        Send
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
