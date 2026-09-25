import {
    useSimulateITournamentTryRecoveringBond,
    useWriteITournamentTryRecoveringBond,
} from "@cartesi/react";
import { Button, Collapse, Group, Stack } from "@mantine/core";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { isNil } from "ramda";
import { useEffect, useRef, type FC } from "react";
import { TbCoins } from "react-icons/tb";
import type { Address } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { content } from "../../content";
import { useSelectedNodeConnection } from "../connection/hooks";
import { InfoHint } from "../InfoHint";
import { TransactionProgress } from "../transactions/TransactionProgress";

const text = content.bond.recovery;

export interface BondRecoveryActionProps {
    /**
     * The tournament holding the recoverable bond.
     */
    tournamentAddress: Address;

    /**
     * Called once the recovery transaction is confirmed.
     */
    onRecovered?: () => void;
}

/**
 * Permissionless `tryRecoveringBond` call: anyone can send it, and the
 * contract pays the winning claimer, never the caller.
 */
export const BondRecoveryAction: FC<BondRecoveryActionProps> = ({
    tournamentAddress,
    onRecovered,
}) => {
    const selectedConnection = useSelectedNodeConnection();
    const account = useAccount();
    const connectModal = useConnectModal();
    const chainModal = useChainModal();
    const needSwitchNetwork = account.isConnected && isNil(account.chain);
    const canSend = !needSwitchNetwork && account.isConnected;

    const prepare = useSimulateITournamentTryRecoveringBond({
        address: tournamentAddress,
        query: { enabled: canSend },
    });
    const execute = useWriteITournamentTryRecoveringBond();
    const wait = useWaitForTransactionReceipt({ hash: execute.data });

    const notified = useRef(false);
    useEffect(() => {
        if (wait.isSuccess && !notified.current) {
            notified.current = true;
            onRecovered?.();
        }
    }, [wait.isSuccess, onRecovered]);

    if (selectedConnection?.type === "system_mock") return null;

    return (
        <Stack gap="xs">
            <Group gap="xs">
                <Button
                    leftSection={<TbCoins />}
                    loading={
                        prepare.isFetching ||
                        execute.isPending ||
                        wait.isLoading
                    }
                    disabled={wait.isSuccess}
                    onClick={() => {
                        if (needSwitchNetwork)
                            return chainModal.openChainModal?.();
                        if (!canSend) return connectModal.openConnectModal?.();
                        if (prepare.data)
                            execute.writeContract(prepare.data.request);
                    }}
                >
                    {wait.isSuccess ? text.recoveredTxt : text.recoverTxt}
                </Button>
                <InfoHint label={text.recoverHint} />
            </Group>
            <Collapse
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
                    confirmationMessage={text.successTxt}
                    defaultErrorMessage={execute.error?.message}
                />
            </Collapse>
        </Stack>
    );
};
