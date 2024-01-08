"use client";
import {
    ERC20DepositForm,
    ERC721DepositForm,
    EtherDepositForm,
    RawInputForm,
} from "@cartesi/rollups-explorer-ui";
import { Select } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { FC, useState } from "react";
import { useSearchApplications } from "../hooks/useSearchApplications";
import { useSearchTokens } from "../hooks/useSearchTokens";

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
    initialDepositType = "ether",
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

    return (
        <>
            <Select
                label="Type"
                placeholder="Select deposit type"
                mb={16}
                data={[
                    {
                        group: "Deposit",
                        items: [
                            { value: "ether", label: "Ether Deposit" },
                            { value: "erc20", label: "ERC-20 Deposit" },
                            { value: "erc721", label: "ERC-721 Deposit" },
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
                />
            ) : depositType === "input" ? (
                <RawInputForm
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={setApplicationId}
                />
            ) : null}
        </>
    );
};
export default SendTransaction;
