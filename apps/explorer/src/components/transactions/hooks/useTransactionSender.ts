"use client";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { isNil } from "ramda";
import { useAccount } from "wagmi";
import { useSelectedNodeConnection } from "../../connection/hooks";

/**
 * Wallet state for a permissionless contract call: whether it can be sent,
 * whether the action should be hidden, and a guard that opens the connect
 * or chain modal first when needed.
 *
 * @returns `canSend` when a wallet is connected on a known chain, `hidden`
 * on the mocked node connection, and `send`, which runs the write or opens
 * the modal the user still has to go through.
 */
export const useTransactionSender = () => {
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
