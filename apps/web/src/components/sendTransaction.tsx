"use client";
import { RollupVersion } from "@cartesi/rollups-explorer-domain/explorer-types";
import {
    AddressRelayForm,
    ERC1155DepositForm,
    ERC20DepositForm,
    ERC721DepositForm,
    EtherDepositForm,
    GenericInputForm,
    GenericInputFormSpecification,
    TransactionFormSuccessData,
    type RollupVersion as RollupVersionUI,
} from "@cartesi/rollups-explorer-ui";
import { Select } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { FC, useCallback, useState } from "react";
import { useSearchApplications } from "../hooks/useSearchApplications";
import { useSearchMultiTokens } from "../hooks/useSearchMultiTokens";
import { useSearchTokens } from "../hooks/useSearchTokens";
import { useAppConfig } from "../providers/appConfigProvider";
import { BlockExplorerLink } from "./BlockExplorerLink";
import { useSpecification } from "./specification/hooks/useSpecification";
import { JSON_ABI } from "./specification/types";

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

type ApplicationSearchableParams = {
    address: string;
    rollupVersion?: RollupVersion;
};

const SendTransaction: FC<DepositProps> = ({
    initialDepositType = "ether",
}) => {
    const [depositType, setDepositType] =
        useState<DepositType>(initialDepositType);
    const [applicationSearchableParams, setApplicationSearchableParams] =
        useState<ApplicationSearchableParams>({ address: "" });

    const [multiTokenId, setMultiTokenId] = useState<string>("");
    const [tokenId, setTokenId] = useState<string>("");

    const [debouncedApplicationSearchableParams] = useDebouncedValue(
        applicationSearchableParams,
        DEBOUNCE_TIME,
    );

    const [debouncedTokenId] = useDebouncedValue(tokenId, DEBOUNCE_TIME);
    const [debouncedMultiTokenId] = useDebouncedValue(
        multiTokenId,
        DEBOUNCE_TIME,
    );

    const { chainId } = useAppConfig();

    const { applications, fetching } = useSearchApplications({
        address: debouncedApplicationSearchableParams.address,
        rollupVersion: debouncedApplicationSearchableParams.rollupVersion,
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
    const { listSpecifications } = useSpecification();
    const specifications =
        listSpecifications()?.filter((s) => s.mode === JSON_ABI) ?? [];

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
            setApplicationSearchableParams({ address: "" });
        },
        [],
    );

    const updateApplicationSearchParams = useCallback(
        (address: string, rollupVersion?: RollupVersionUI) =>
            setApplicationSearchableParams({
                address,
                rollupVersion: rollupVersion as RollupVersion,
            }),
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
                        items: [{ value: "input", label: "Generic Input" }],
                    },
                ]}
                value={depositType}
                onChange={(nextValue) => {
                    setDepositType(nextValue as DepositType);
                    setApplicationSearchableParams({ address: "" });
                }}
            />

            {depositType === "ether" ? (
                <EtherDepositForm
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={updateApplicationSearchParams}
                    onSuccess={onSuccess}
                />
            ) : depositType === "erc20" ? (
                <ERC20DepositForm
                    tokens={tokens}
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={updateApplicationSearchParams}
                    onSearchTokens={setTokenId}
                    onSuccess={onSuccess}
                />
            ) : depositType === "erc721" ? (
                <ERC721DepositForm
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={updateApplicationSearchParams}
                    onSuccess={onSuccess}
                />
            ) : depositType === "input" ? (
                <GenericInputForm
                    applications={applications}
                    specifications={
                        specifications as GenericInputFormSpecification[]
                    }
                    isLoadingApplications={fetching}
                    onSearchApplications={updateApplicationSearchParams}
                    onSuccess={onSuccess}
                />
            ) : depositType === "erc1155" ? (
                <ERC1155DepositForm
                    mode="single"
                    tokens={multiTokens}
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={updateApplicationSearchParams}
                    onSearchTokens={setMultiTokenId}
                    onSuccess={onSuccess}
                />
            ) : depositType === "erc1155Batch" ? (
                <ERC1155DepositForm
                    mode="batch"
                    tokens={multiTokens}
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={updateApplicationSearchParams}
                    onSearchTokens={setMultiTokenId}
                    onSuccess={onSuccess}
                />
            ) : depositType === "relay" ? (
                <AddressRelayForm
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={updateApplicationSearchParams}
                    onSuccess={onSuccess}
                />
            ) : null}
        </>
    );
};
export default SendTransaction;
