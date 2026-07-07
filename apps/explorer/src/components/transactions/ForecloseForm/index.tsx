import type { Application } from "@cartesi/viem";
import {
    useReadApplicationIsForeclosed,
    useSimulateApplicationForeclose,
    useWriteApplicationForeclose,
} from "@cartesi/wagmi";
import {
    Button,
    Collapse,
    Group,
    Notification,
    Stack,
    Text,
} from "@mantine/core";
import { isNil, isNotNil } from "ramda";
import { useEffect, useMemo, type FC } from "react";
import { TbLockFilled } from "react-icons/tb";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { content } from "../../../content";
import type { TransactionFormSuccessData } from "../DepositFormTypes";
import TransactionDetails from "../TransactionDetails";
import { TransactionProgress } from "../TransactionProgress";

interface ForecloseFormProps {
    application: Application;
    onSuccess: (receipt: TransactionFormSuccessData) => void;
}

export const ForecloseForm: FC<ForecloseFormProps> = (props) => {
    const { application, onSuccess } = props;

    // connected account
    const { address } = useAccount();

    const {
        data: isApplicationForeclosed,
        isLoading: isCheckingIfForeclosed,
        refetch: recheckIfForeclosed,
    } = useReadApplicationIsForeclosed({
        address: application.applicationAddress,
        query: {
            enabled: isNotNil(application.applicationAddress),
        },
    });

    const prepare = useSimulateApplicationForeclose({
        address: application.applicationAddress,
        query: {
            enabled:
                isNotNil(application.applicationAddress) &&
                isNotNil(address) &&
                isNotNil(isApplicationForeclosed) &&
                isApplicationForeclosed === false,
        },
    });

    const execute = useWriteApplicationForeclose();

    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });

    const canSubmit =
        !isCheckingIfForeclosed &&
        isApplicationForeclosed === false &&
        isNotNil(address) &&
        !prepare.isLoading &&
        isNotNil(prepare.data?.request) &&
        isNil(prepare.error);
    const loading = execute.isPending || wait.isLoading;

    const details = useMemo(
        () => [
            {
                legend: content.global.application.address,
                text: application.applicationAddress,
            },
        ],
        [application.applicationAddress],
    );

    const executeReset = execute.reset;

    useEffect(() => {
        if (wait.isSuccess) {
            onSuccess({
                receipt: wait.data,
                type: "FORECLOSE",
                message: content.foreclose.generic.txSuccess,
            });
            recheckIfForeclosed();
            executeReset();
        }
    }, [
        wait.isSuccess,
        wait.data,
        executeReset,
        onSuccess,
        recheckIfForeclosed,
    ]);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (canSubmit) {
                    execute.writeContract(prepare.data!.request);
                }
            }}
            data-testid="foreclose-form"
        >
            <Stack>
                <TransactionDetails details={details} defaultOpened={true} />

                <Collapse
                    in={
                        !isCheckingIfForeclosed &&
                        isApplicationForeclosed === false
                    }
                >
                    <Notification
                        color="info"
                        title={content.global.alert.reminder}
                        withCloseButton={false}
                        style={{ boxShadow: "none" }}
                    >
                        {content.foreclose.foreclosingWarning}
                    </Notification>
                </Collapse>

                <Collapse
                    data-testid="foreclose-progress"
                    in={
                        execute.isPending ||
                        wait.isLoading ||
                        execute.isSuccess ||
                        execute.isError ||
                        prepare.isError
                    }
                >
                    <TransactionProgress
                        prepare={prepare}
                        execute={execute}
                        wait={wait}
                        confirmationMessage={
                            content.foreclose.generic.txSuccess
                        }
                        defaultErrorMessage={execute.error?.message}
                    />
                </Collapse>

                <Group justify="right">
                    <Button
                        disabled={!canSubmit}
                        leftSection={<TbLockFilled />}
                        loading={loading}
                        type="submit"
                    >
                        <Text>
                            {isApplicationForeclosed
                                ? content.foreclose.foreclosedTxt
                                : content.foreclose.forecloseTxt}
                        </Text>
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
