"use client";
import {
    ERC20DepositForm,
    RawInputForm,
    EtherDepositForm,
} from "@cartesi/rollups-explorer-ui";
import { FC, useMemo, useState } from "react";
import { Select } from "@mantine/core";
import { useApplicationsQuery, useTokensQuery } from "../graphql";
import { useDebouncedValue } from "@mantine/hooks";

export type DepositType = "erc20" | "ether" | "input";

interface DepositProps {
    initialDepositType?: DepositType;
}

const SendTransaction: FC<DepositProps> = ({
    initialDepositType = "erc20",
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
                data={[
                    { value: "erc20", label: "ERC20" },
                    { value: "ether", label: "Ether" },
                    { value: "input", label: "Raw input" },
                ]}
                value={depositType}
                onChange={(nextValue: DepositType) => {
                    setDepositType(nextValue);
                    setApplicationId("");
                }}
            />
            <br />

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
