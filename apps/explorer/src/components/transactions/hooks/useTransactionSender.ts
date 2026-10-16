"use client";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { isNil } from "ramda";
import { useAccount } from "wagmi";
import { useSelectedNodeConnection } from "../../connection/hooks";

/** Wallet state for a permissionless contract call: whether it can be sent, whether the action is hidden on the mocked connection, and `send`, which runs the write or opens the connect or chain modal first. */
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
