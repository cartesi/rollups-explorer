import { FC, useEffect, useMemo } from "react";
import {
    useEtherPortalDepositEther,
    usePrepareEtherPortalDepositEther,
} from "@cartesi/rollups-wagmi";
import {
    Button,
    Collapse,
    Group,
    Stack,
    Autocomplete,
    Alert,
    Textarea,
    Loader,
    Text,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
    TbCheck,
    TbAlertCircle,
    TbChevronUp,
    TbChevronDown,
} from "react-icons/tb";
import {
    BaseError,
    getAddress,
    isAddress,
    isHex,
    toHex,
    zeroAddress,
} from "viem";
import { useWaitForTransaction } from "wagmi";
import { TransactionProgress } from "./TransactionProgress";

export interface EtherDepositFormProps {
    applications: string[];
}

export const EtherDepositForm: FC<EtherDepositFormProps> = ({
    applications,
}) => {
    const addresses = useMemo(
        () => applications.map(getAddress),
        [applications],
    );
    const [advanced, { toggle: toggleAdvanced }] = useDisclosure(false);
    const form = useForm({
        validateInputOnBlur: true,
        initialValues: {
            application: "",
            amount: "",
            execLayerData: "0x",
        },
        validate: {
            application: (value) =>
                value !== "" && isAddress(value) ? null : "Invalid application",
            amount: (value) =>
                value !== "" && Number(value) > 0 ? null : "Invalid amount",
            execLayerData: (value) =>
                isHex(value) ? null : "Invalid hex string",
        },
        transformValues: (values) => ({
            address: isAddress(values.application)
                ? getAddress(values.application)
                : zeroAddress,
            amountBigint:
                values.amount !== "" ? BigInt(values.amount) : undefined,
            execLayerData: toHex(values.execLayerData),
        }),
    });
    const { address, amountBigint, execLayerData } =
        form.getTransformedValues();
    const application = form.getInputProps("application");
    const prepare = usePrepareEtherPortalDepositEther({
        args: [address, execLayerData],
        value: amountBigint,
        enabled: form.isValid(),
    });
    const execute = useEtherPortalDepositEther(prepare.config);
    const wait = useWaitForTransaction(execute.data);
    const canSubmit =
        form.isValid() && !prepare.isLoading && prepare.error === null;
    const loading = execute.status === "loading" || wait.status === "loading";

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
                        form.errors?.application ||
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

                <TextInput
                    type="number"
                    step="1"
                    min={0}
                    label="Amount"
                    description="Amount of ether to deposit"
                    placeholder="0"
                    rightSectionWidth={60}
                    rightSection={<Text>ETH</Text>}
                    withAsterisk
                    {...form.getInputProps("amount")}
                />

                <Collapse in={advanced}>
                    <Textarea
                        label="Extra data"
                        description="Extra execution layer data handled by the application"
                        {...form.getInputProps("execLayerData")}
                    />
                </Collapse>

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
                        confirmationMessage="Ether deposited successfully!"
                        defaultErrorMessage={execute.error?.message}
                    />
                </Collapse>

                <Group justify="right">
                    <Button
                        leftSection={
                            advanced ? <TbChevronUp /> : <TbChevronDown />
                        }
                        size="xs"
                        visibleFrom="sm"
                        variant="transparent"
                        onClick={toggleAdvanced}
                    >
                        Advanced
                    </Button>

                    <Button
                        variant="filled"
                        disabled={!canSubmit}
                        leftSection={<TbCheck />}
                        loading={loading}
                        onClick={execute.write}
                    >
                        Deposit
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
