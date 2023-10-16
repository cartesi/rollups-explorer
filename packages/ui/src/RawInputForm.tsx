import { FC, useCallback, useEffect, useState } from "react";
import { useInputBoxAddInput } from "@cartesi/rollups-wagmi";
import {
    Button,
    Collapse,
    Group,
    Stack,
    Textarea,
    Autocomplete,
    Alert,
} from "@mantine/core";
import { TbCheck, TbAlertCircle } from "react-icons/tb";
import { isHex } from "viem";
import { useWaitForTransaction } from "wagmi";
import { TransactionProgress } from "./TransactionProgress";

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
                <Alert variant="light" color="yellow" icon={<TbAlertCircle />}>
                    This is a deposit to an undeployed application.
                </Alert>
            )}
        </>
    );
};

export interface RawInputFormProps {
    applications: string[];
    onSubmit: () => void;
}

export const RawInputForm: FC<RawInputFormProps> = (props) => {
    const { applications, onSubmit } = props;
    const [rawInput, setRawInput] = useState<string>("0x");
    const [application, setApplication] = useState("");
    const addInput = useInputBoxAddInput({
        args: [application as `0x${string}`, rawInput as `0x${string}`],
    });
    const addInputWait = useWaitForTransaction(addInput.data);
    const canSubmitInput = application !== "" && isHex(rawInput);
    const loading =
        addInput.status === "loading" || addInputWait.status === "loading";

    const onSend = useCallback(() => {
        addInput.write();
    }, [addInput]);

    useEffect(() => {
        if (addInputWait.status === "success") {
            setApplication("");
            setRawInput("0x");
            onSubmit();
        }
    }, [addInputWait.status, onSubmit]);

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

                <Collapse
                    in={
                        addInput.isLoading ||
                        addInputWait.isLoading ||
                        addInput.isSuccess ||
                        addInput.isError
                    }
                >
                    <TransactionProgress
                        prepare={addInput}
                        execute={addInput}
                        wait={addInputWait}
                        confirmationMessage="Raw input sent successfully!"
                        defaultErrorMessage={addInput.error?.message}
                    />
                </Collapse>

                <Group justify="right">
                    <Button
                        variant="filled"
                        disabled={!canSubmitInput}
                        leftSection={<TbCheck />}
                        loading={loading}
                        onClick={onSend}
                    >
                        Send
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
