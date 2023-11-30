"use client";
import {
    ERC20DepositForm,
    EtherDepositForm,
    RawInputForm,
} from "@cartesi/rollups-explorer-ui";
import { FC, useMemo, useState } from "react";
import { Select } from "@mantine/core";
import { useApplicationsQuery, useTokensQuery } from "../graphql";
import { useDebouncedValue } from "@mantine/hooks";

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
    const [applicationId, setApplicationId] = useState("");
    const [debouncedApplicationId] = useDebouncedValue(applicationId, 400);
    const [{ data: applicationData, fetching }] = useApplicationsQuery({
        variables: {
            limit: 10,
            where: {
                id_containsInsensitive: debouncedApplicationId ?? "",
            },
        },
    });
    const applications = useMemo(
        () => (applicationData?.applications ?? []).map((a) => a.id),
        [applicationData],
    );
    const [{ data: tokenData }] = useTokensQuery({
        variables: {
            limit: 100,
        },
    });
    const tokens = useMemo(
        () =>
            (tokenData?.tokens ?? []).map(
                (a) => `${a.symbol} - ${a.name} - ${a.id}`,
            ),
        [tokenData],
    );

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

            {depositType === "erc20" ? (
                <ERC20DepositForm
                    tokens={tokens}
                    applications={applications}
                    isLoadingApplications={fetching}
                    onSearchApplications={setApplicationId}
                />
            ) : depositType === "ether" ? (
                <EtherDepositForm
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
