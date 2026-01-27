"use client";
import type { Application } from "@cartesi/viem";
import { Group, Modal, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { defaultTo, isNil, isNotNil } from "ramda";
import { useCallback, type FC } from "react";
import { useConfig } from "wagmi";
import { BlockExplorerLink } from "../BlockExplorerLink";
import type { TransactionFormSuccessData } from "../transactions/DepositFormTypes";
import { ERC1155DepositForm } from "../transactions/ERC1155DepositForm";
import { ERC20DepositForm } from "../transactions/ERC20DepositForm";
import { ERC721DepositForm } from "../transactions/ERC721DepositForm";
import { EtherDepositForm } from "../transactions/EtherDepositForm";
import { useSendAction, useSendState } from "./hooks";
import type { TransactionType } from "./SendContexts";

const wordingPrefix: Record<TransactionType, string> = {
    deposit_eth: "Send Eth to",
    generic_input: "Send Generic Input to",
    deposit_erc1155Batch: "Send Batch ERC-1155 to",
    deposit_erc1155Single: "Send ERC-1155 to",
    deposit_erc20: "Send ERC-20 to",
    deposit_erc721: "Send ERC-721 to",
};

type SendModalTitleProps = {
    transactionType?: TransactionType;
    application?: Application;
};

const SendModalTitle: FC<SendModalTitleProps> = ({
    application,
    transactionType,
}) => {
    if (isNil(application) || isNil(transactionType)) return "";

    const appId = defaultTo(application.applicationAddress, application.name);
    const title = wordingPrefix[transactionType];

    return (
        <Group gap={5} justify="center" align="center" fz="xl">
            <Text fz="inherit">{title}</Text>{" "}
            <Text tt="capitalize" fz="inherit">
                {appId}
            </Text>
        </Group>
    );
};

const SendModal: FC = () => {
    const state = useSendState();
    const actions = useSendAction();
    const config = useConfig();

    const onSuccess = useCallback(
        ({ receipt, type }: TransactionFormSuccessData) => {
            const message = receipt?.transactionHash
                ? {
                      message: (
                          <BlockExplorerLink
                              value={receipt.transactionHash.toString()}
                              type="tx"
                              chain={config.chains[0]}
                          />
                      ),
                      title: `${type} transaction completed`,
                  }
                : { message: `${type} transaction completed.` };

            notifications.show({
                withCloseButton: true,
                autoClose: false,
                color: "green",
                ...message,
            });
        },
        [config],
    );

    if (!state) return "";

    return (
        <Modal
            opened={isNotNil(state)}
            onClose={actions.closeModal}
            title={
                <SendModalTitle
                    application={state.application}
                    transactionType={state.transactionType}
                />
            }
        >
            {state.transactionType === "deposit_eth" ? (
                <EtherDepositForm
                    application={state.application}
                    onSuccess={onSuccess}
                />
            ) : state.transactionType === "deposit_erc20" ? (
                <ERC20DepositForm
                    application={state.application}
                    onSuccess={onSuccess}
                />
            ) : state.transactionType === "deposit_erc1155Single" ? (
                <ERC1155DepositForm
                    mode="single"
                    application={state.application}
                    onSuccess={onSuccess}
                />
            ) : state.transactionType === "deposit_erc1155Batch" ? (
                <ERC1155DepositForm
                    mode="batch"
                    application={state.application}
                    onSuccess={onSuccess}
                />
            ) : state.transactionType === "deposit_erc721" ? (
                <ERC721DepositForm
                    application={state.application}
                    onSuccess={onSuccess}
                />
            ) : null}
        </Modal>
    );
};

export default SendModal;
