import {
    Button,
    Collapse,
    Flex,
    Group,
    Loader,
    Stack,
    Text,
    TextInput,
    Textarea,
    UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FC, useEffect } from "react";
import { TbCheck, TbChevronDown, TbChevronUp } from "react-icons/tb";
import { BaseError } from "viem";
import { TransactionFormSuccessData } from "../DepositFormTypes";
import { TransactionProgress } from "../TransactionProgress";
import { RollupVersion } from "../commons/interfaces";
import useEtherDeposit from "./hooks/useDepositEther";
import { EtherDepositFormReturn } from "./types";

interface EtherDepositSectionProps {
    form: EtherDepositFormReturn;
    appVersion: RollupVersion;
    onSuccess: (d: TransactionFormSuccessData) => void;
}

const EtherDepositSection: FC<EtherDepositSectionProps> = ({
    form,
    appVersion,
    onSuccess,
}) => {
    const [advanced, { toggle: toggleAdvanced }] = useDisclosure(false);
    const { accountBalance } = form.getValues();
    const { address, amount, execLayerData } = form.getTransformedValues();

    const { prepare, execute, wait } = useEtherDeposit({
        appVersion,
        contractParams: {
            args: [address, execLayerData],
            value: amount,
        },
        isQueryEnabled: form.isValid(),
    });

    const canSubmit =
        form.isValid() && !prepare.isLoading && prepare.error === null;
    const loading = execute.isPending || wait.isLoading;

    useEffect(() => {
        if (wait.isSuccess) {
            onSuccess({ receipt: wait.data, type: "ETHER" });
            execute.reset();
        }
    }, [wait, onSuccess, execute]);

    return (
        <Stack>
            <Stack gap="xs">
                <TextInput
                    type="number"
                    step="1"
                    min={0}
                    label="Amount"
                    description="Amount of ether to deposit"
                    placeholder="0"
                    data-testid="eth-amount-input"
                    rightSectionWidth={60}
                    rightSection={
                        prepare.isFetching ? (
                            <Loader size="xs" />
                        ) : (
                            <Text>ETH</Text>
                        )
                    }
                    withAsterisk
                    {...form.getInputProps("amount")}
                    error={
                        form.errors?.amount ||
                        (prepare.error as BaseError)?.shortMessage
                    }
                />

                <Flex c={"dark.2"} gap="3">
                    <Text fz="xs">Balance: {accountBalance.formatted}</Text>
                    {accountBalance.value > 0 && (
                        <UnstyledButton
                            fz={"xs"}
                            c={"cyan"}
                            onClick={() => {
                                form.setFieldValue(
                                    "amount",
                                    accountBalance.formatted,
                                );
                            }}
                            data-testid="max-button"
                        >
                            Max
                        </UnstyledButton>
                    )}
                </Flex>
            </Stack>

            <Collapse in={advanced}>
                <Textarea
                    label="Extra data"
                    data-testid="eth-extra-data-input"
                    description="Extra execution layer data handled by the application"
                    {...form.getInputProps("execLayerData")}
                />
            </Collapse>

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
                    confirmationMessage="Ether deposited successfully!"
                    defaultErrorMessage={execute.error?.message}
                />
            </Collapse>

            <Group justify="right">
                <Button
                    leftSection={advanced ? <TbChevronUp /> : <TbChevronDown />}
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
                    onClick={() => execute.writeContract(prepare.data!.request)}
                >
                    Deposit
                </Button>
            </Group>
        </Stack>
    );
};

export default EtherDepositSection;
