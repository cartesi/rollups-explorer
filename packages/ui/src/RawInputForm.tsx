import { FC, useEffect, useState } from "react";
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
import { TbCheck, TbAlertCircle } from "react-icons/tb";
import { BaseError, isHex } from "viem";
import { useWaitForTransaction } from "wagmi";
import { cacheExchange, fetchExchange } from "@urql/core";
import { withUrqlClient } from "next-urql";
import { useApplicationsQuery } from "web/src/graphql";
import { TransactionProgress } from "./TransactionProgress";

export interface ApplicationAutocompleteProps {
    applications: string[];
    application: string;
    error?: string;
    isLoading?: boolean;
    onChange: (application: string) => void;
}
export const ApplicationAutocomplete: FC<ApplicationAutocompleteProps> = (
    props
) => {
    const {
        applications,
        application,
        error,
        isLoading = false,
        onChange,
    } = props;

    return (
        <>
            <Autocomplete
                label="Application"
                description="The application smart contract address"
                placeholder="0x"
                data={applications}
                value={application}
                error={error}
                withAsterisk
                rightSection={isLoading && <Loader size="xs" />}
                onChange={onChange}
            />

            {application !== "" && !applications.includes(application) && (
                <Alert variant="light" color="yellow" icon={<TbAlertCircle />}>
                    This is an undeployed application.
                </Alert>
            )}
        </>
    );
};

export interface RawInputFormProps {
    onSubmit: () => void;
}

export const RawInputForm = withUrqlClient((ssrExchange) => ({
    url: process.env.NEXT_PUBLIC_EXPLORER_API_URL as string,
    exchanges: [cacheExchange, ssrExchange, fetchExchange],
}))((props: RawInputFormProps) => {
    const { onSubmit } = props;
    const [rawInput, setRawInput] = useState<string>("0x");
    const [application, setApplication] = useState("");
    const isValidInput = application !== "" && isHex(rawInput);
    const [{ data: applicationData }] = useApplicationsQuery();
    const applications = (applicationData?.applications ?? []).map((a) => a.id);
    const addInputPrepare = usePrepareInputBoxAddInput({
        args: [application as `0x${string}`, rawInput as `0x${string}`],
        enabled: isValidInput,
    });
    const canSubmit = isValidInput && addInputPrepare.error === null;
    const addInput = useInputBoxAddInput(addInputPrepare.config);
    const addInputWait = useWaitForTransaction(addInput.data);
    const loading =
        addInput.status === "loading" || addInputWait.status === "loading";

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
                    error={(addInputPrepare.error as BaseError)?.shortMessage}
                    isLoading={addInputPrepare.isLoading}
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
                        prepare={addInputPrepare}
                        execute={addInput}
                        wait={addInputWait}
                        confirmationMessage="Raw input sent successfully!"
                        defaultErrorMessage={addInput.error?.message}
                    />
                </Collapse>

                <Group justify="right">
                    <Button
                        variant="filled"
                        disabled={!canSubmit}
                        leftSection={<TbCheck />}
                        loading={loading}
                        onClick={addInput.write}
                    >
                        Send
                    </Button>
                </Group>
            </Stack>
        </form>
    );
});
