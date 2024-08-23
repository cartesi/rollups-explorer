"use client";
import {
    AddressRelayForm,
    ERC1155DepositForm,
    ERC20DepositForm,
    ERC721DepositForm,
    EtherDepositForm,
    RawInputForm,
    TransactionFormSuccessData,
} from "@cartesi/rollups-explorer-ui";
import { Select } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { FC, useCallback, useState } from "react";
import { useSearchApplications } from "../hooks/useSearchApplications";
import { useSearchMultiTokens } from "../hooks/useSearchMultiTokens";
import { useSearchTokens } from "../hooks/useSearchTokens";
import getConfiguredChainId from "../lib/getConfiguredChain";
import { BlockExplorerLink } from "./BlockExplorerLink";

export type DepositType =
    | "ether"
    | "erc20"
    | "erc721"
    | "erc1155"
    | "erc1155Batch"
    | "relay"
    | "input";

interface DepositProps {
    initialDepositType?: DepositType;
}

const DEBOUNCE_TIME = 400 as const;

const SendTransaction: FC<DepositProps> = ({
    initialDepositType = "ether",
}) => {
    const [depositType, setDepositType] =
        useState<DepositType>(initialDepositType);
    const [applicationId, setApplicationId] = useState<string>("");
    const [multiTokenId, setMultiTokenId] = useState<string>("");
    const [tokenId, setTokenId] = useState<string>("");
    const [debouncedApplicationId] = useDebouncedValue(
        applicationId,
        DEBOUNCE_TIME,
    );
    const [debouncedTokenId] = useDebouncedValue(tokenId, DEBOUNCE_TIME);
    const [debouncedMultiTokenId] = useDebouncedValue(
        multiTokenId,
        DEBOUNCE_TIME,
    );
    const chainId = getConfiguredChainId();
    const { applications, fetching } = useSearchApplications({
        address: debouncedApplicationId,
        chainId,
    });
    const { tokens } = useSearchTokens({
        address: debouncedTokenId,
        chainId,
    });
    const { multiTokens } = useSearchMultiTokens({
        address: debouncedMultiTokenId,
        chainId,
    });

    const onSuccess = useCallback(
        ({ receipt, type }: TransactionFormSuccessData) => {
            const message = receipt?.transactionHash
                ? {
                      message: (
                          <BlockExplorerLink
                              value={receipt.transactionHash.toString()}
                              type="tx"
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

            setMultiTokenId("");
            setApplicationId("");
        },
        [],
    );

    return (
        <>
            <Select
                label="Type"
                placeholder="Select transaction type"
                mb={16}
                allowDeselect={false}
                data={[
                    {
                        group: "Deposit",
                        items: [
                            { value: "ether", label: "Ether Deposit" },
                            { value: "erc20", label: "ERC-20 Deposit" },
                            { value: "erc721", label: "ERC-721 Deposit" },
                            { value: "erc1155", label: "ERC-1155 Deposit" },
                            {
                                value: "erc1155Batch",
                                label: "ERC-1155 Batch Deposit",
                            },
                        ],
                    },
                    {
                        group: "Relay",
                        items: [
                            { value: "relay", label: "Application Address" },
                        ],
                    },
                    {
                        group: "Other",
                        items: [{ value: "input", label: "Raw Input" }],
                    },
                ]}
                value={depositType}
                onChange={(nextValue) => {
                    setDepositType(nextValue as DepositType);
                    setApplicationId("");
                }}
            />

            {depositType === "ether" ? (
                <EtherDepositForm
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={setApplicationId}
                    onSuccess={onSuccess}
                />
            ) : depositType === "erc20" ? (
                <ERC20DepositForm
                    tokens={tokens}
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={setApplicationId}
                    onSearchTokens={setTokenId}
                    onSuccess={onSuccess}
                />
            ) : depositType === "erc721" ? (
                <ERC721DepositForm
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={setApplicationId}
                    onSuccess={onSuccess}
                />
            ) : depositType === "input" ? (
                <RawInputForm
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={setApplicationId}
                    onSuccess={onSuccess}
                />
            ) : depositType === "erc1155" ? (
                <ERC1155DepositForm
                    mode="single"
                    tokens={multiTokens}
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={setApplicationId}
                    onSearchTokens={setMultiTokenId}
                    onSuccess={onSuccess}
                />
            ) : depositType === "erc1155Batch" ? (
                <ERC1155DepositForm
                    mode="batch"
                    tokens={multiTokens}
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={setApplicationId}
                    onSearchTokens={setMultiTokenId}
                    onSuccess={onSuccess}
                />
            ) : depositType === "relay" ? (
                <AddressRelayForm
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={setApplicationId}
                    onSuccess={onSuccess}
                />
            ) : null}
        </>
    );
};
export default SendTransaction;
