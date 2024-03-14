"use client";
import { Grid } from "@mantine/core";
import { FC } from "react";
import { TbApps, TbInbox } from "react-icons/tb";
import { useAccount } from "wagmi";
import { SummaryCard } from "./SummaryCard";

export type SummaryProps = {
    inputs: number;
    applications: number;
    applicationsOwned: number;
};

export const Summary: FC<SummaryProps> = ({
    inputs,
    applications,
    applicationsOwned,
}: SummaryProps) => {
    const { isConnected } = useAccount();
    return (
        <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: isConnected ? 4 : 6 }} my="md">
                <SummaryCard title="Inputs" icon={TbInbox} value={inputs} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: isConnected ? 4 : 6 }} my="md">
                <SummaryCard
                    title="Applications"
                    icon={TbApps}
                    value={applications}
                />
            </Grid.Col>
            {isConnected && (
                <Grid.Col span={{ base: 12, md: 4 }} my="md">
                    <SummaryCard
                        title="My Applications"
                        icon={TbApps}
                        value={applicationsOwned}
                    />
                </Grid.Col>
            )}
        </Grid>
    );
};
