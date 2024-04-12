"use client";
import {
    DepositFormSuccessData,
    ERC1155DepositForm,
    ERC20DepositForm,
    ERC721DepositForm,
    EtherDepositForm,
    RawInputForm,
} from "@cartesi/rollups-explorer-ui";
import { Select } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { FC, useCallback, useState } from "react";
import { useSearchApplications } from "../hooks/useSearchApplications";
import { useSearchTokens } from "../hooks/useSearchTokens";
import { BlockExplorerLink } from "./BlockExplorerLink";

export type DepositType =
    | "ether"
    | "erc20"
    | "erc721"
    | "erc1155"
    | "relay"
    | "input";

interface DepositProps {
    initialDepositType?: DepositType;
}

const SendTransaction: FC<DepositProps> = ({
    initialDepositType = "erc1155",
}) => {
    const [depositType, setDepositType] =
        useState<DepositType>(initialDepositType);
    const [applicationId, setApplicationId] = useState<string>("");
    const [tokenId, setTokenId] = useState<string>("");
    const [debouncedApplicationId] = useDebouncedValue(applicationId, 400);
    const [debouncedTokenId] = useDebouncedValue(tokenId, 400);
    const { applications, fetching } = useSearchApplications({
        address: debouncedApplicationId,
    });
    const { tokens } = useSearchTokens({
        address: debouncedTokenId,
    });

    const onDepositErc721 = useCallback(() => {
        notifications.show({
            message: "Token was deposited successfully",
            color: "green",
            withBorder: true,
        });
    }, []);

    const onSuccess = useCallback(
        ({ receipt, type }: DepositFormSuccessData) => {
            const message = receipt?.transactionHash
                ? {
                      message: (
                          <BlockExplorerLink
                              value={receipt.transactionHash.toString()}
                              type="tx"
                          />
                      ),
                      title: `${type} transfer completed`,
                  }
                : { message: `${type} transfer completed.` };

            notifications.show({
                withCloseButton: true,
                autoClose: false,
                color: "green",
                ...message,
            });

            setTokenId("");
        },
        [],
    );

    return (
        <>
            <Select
                label="Type"
                placeholder="Select deposit type"
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
                />
            ) : depositType === "erc20" ? (
                <ERC20DepositForm
                    tokens={tokens}
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={setApplicationId}
                    onSearchTokens={setTokenId}
                />
            ) : depositType === "erc721" ? (
                <ERC721DepositForm
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={setApplicationId}
                    onDeposit={onDepositErc721}
                />
            ) : depositType === "input" ? (
                <RawInputForm
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={setApplicationId}
                />
            ) : depositType === "erc1155" ? (
                <ERC1155DepositForm
                    tokens={[]}
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={setApplicationId}
                    onSearchTokens={setTokenId}
                    onSuccess={onSuccess}
                />
            ) : null}
        </>
    );
};
export default SendTransaction;
