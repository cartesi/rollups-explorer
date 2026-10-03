import { Button, Collapse, Group, Stack, Text } from "@mantine/core";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { isNil } from "ramda";
import { useEffect, useRef, type FC, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { useSelectedNodeConnection } from "../connection/hooks";
import { InfoHint } from "../InfoHint";
import {
    TransactionProgress,
    type TransactionProgressProps,
} from "../transactions/TransactionProgress";

/**
 * Wallet state for a permissionless dispute call: whether it can be sent,
 * and a guard that opens the connect or chain modal first when needed.
 */
export const useDisputeSender = () => {
    const selectedConnection = useSelectedNodeConnection();
    const account = useAccount();
    const connectModal = useConnectModal();
    const chainModal = useChainModal();
    const needSwitchNetwork = account.isConnected && isNil(account.chain);
    const canSend = !needSwitchNetwork && account.isConnected;

    return {
        canSend,
        hidden: selectedConnection?.type === "system_mock",
        send: (write: () => void) => {
            if (needSwitchNetwork) return chainModal.openChainModal?.();
            if (!canSend) return connectModal.openConnectModal?.();
            write();
        },
    };
};

type Stages = Pick<TransactionProgressProps, "prepare" | "execute" | "wait">;

export interface DisputeActionButtonProps {
    /**
     * Label once the transaction is confirmed.
     */
    doneLabel: string;

    /**
     * Extra line under the button, such as when the call expires.
     */
    footer?: ReactNode;

    /**
     * Explanation shown next to the button.
     */
    hint: string;

    icon?: ReactNode;

    label: string;

    /**
     * Whether the call is still being prepared.
     */
    loading?: boolean;

    /**
     * Called once the transaction is confirmed.
     */
    onConfirmed?: () => void;

    onSend: () => void;

    /**
     * Simulation, write and receipt states of the call.
     */
    stages: Stages & {
        pending: boolean;
        confirmed: boolean;
        started: boolean;
    };

    successMessage: string;
}

export const DisputeActionButton: FC<DisputeActionButtonProps> = ({
    doneLabel,
    footer,
    hint,
    icon,
    label,
    loading,
    onConfirmed,
    onSend,
    stages,
    successMessage,
}) => {
    const { prepare, execute, wait, pending, confirmed, started } = stages;

    const notified = useRef(false);
    useEffect(() => {
        if (confirmed && !notified.current) {
            notified.current = true;
            onConfirmed?.();
        }
    }, [confirmed, onConfirmed]);

    return (
        <Stack gap="xs">
            <Group gap="xs">
                <Button
                    leftSection={icon}
                    loading={loading || pending}
                    disabled={confirmed}
                    onClick={onSend}
                >
                    {confirmed ? doneLabel : label}
                </Button>
                <InfoHint label={hint} />
            </Group>
            {footer && !confirmed && (
                <Text size="xs" c="orange">
                    {footer}
                </Text>
            )}
            <Collapse in={started}>
                <TransactionProgress
                    prepare={prepare}
                    execute={execute}
                    wait={wait}
                    confirmationMessage={successMessage}
                    defaultErrorMessage={execute.error?.message}
                />
            </Collapse>
        </Stack>
    );
};
