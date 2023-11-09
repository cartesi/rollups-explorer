import { FC, useEffect } from "react";
import {
    useEtherPortalDepositEther,
    usePrepareEtherPortalDepositEther,
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
    Textarea,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
    TbAlertCircle,
    TbCheck,
    TbChevronDown,
    TbChevronUp,
} from "react-icons/tb";
import {
    BaseError,
    getAddress,
    isAddress,
    isHex,
    parseUnits,
    toHex,
    zeroAddress,
} from "viem";
import { useNetwork, useWaitForTransaction } from "wagmi";
import { TransactionProgress } from "./TransactionProgress";

export interface EtherDepositFormProps {
    applications: string[];
}

export const EtherDepositForm: FC<EtherDepositFormProps> = ({
    applications,
}) => {
    const [advanced, { toggle: toggleAdvanced }] = useDisclosure(false);
    const { chain } = useNetwork();
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
            amount:
                values.amount !== ""
                    ? parseUnits(
                          values.amount,
                          chain?.nativeCurrency.decimals ?? 18,
                      )
                    : undefined,
            execLayerData: toHex(values.execLayerData),
        }),
    });
    const { address, amount, execLayerData } = form.getTransformedValues();
    const prepare = usePrepareEtherPortalDepositEther({
        args: [address, execLayerData],
        value: amount,
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    !applications.some(
                        (a) => a.toLowerCase() === address.toLowerCase(),
                    ) && (
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
