import type {
    Application,
    GetEpochReturnType,
    GetInputReturnType,
    GetTournamentReturnType,
    GetWithdrawalReturnType,
} from "@cartesi/viem";
import { Anchor, Card, Grid, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { head } from "ramda";
import { isNilOrEmpty } from "ramda-adjunct";
import { Activity, type FC } from "react";
import {
    TbClock,
    TbInbox,
    TbMail,
    TbMessageReport,
    TbStack2,
    TbTransferOut,
    TbTrophy,
} from "react-icons/tb";
import Address from "../components/Address";
import { ApplicationForecloseStatus } from "../components/application/ApplicationForecloseStatus";
import { isForeclosed } from "../components/application/utils";
import CenteredText from "../components/CenteredText";
import { EpochList } from "../components/epoch/EpochList";
import { InputList } from "../components/input/InputList";
import PageTitle from "../components/layout/PageTitle";
import { SummaryCard } from "../components/SummaryCard";
import { WithdrawalList } from "../components/withdrawal/WithdrawalList";
import { pathBuilder } from "../routes/routePathBuilder";

type OmitNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] };

type Meta<T> = OmitNever<{
    totalCount: number;
    data: T extends never ? never : T;
    isLoading: boolean;
}>;

interface Props {
    application: Application;
    inputs: Meta<GetInputReturnType[]>;
    epochs: Meta<GetEpochReturnType[]>;
    withdrawals: Meta<GetWithdrawalReturnType[]>;
    outputs: Meta<never>;
    reports: Meta<never>;
    tournaments: Meta<GetTournamentReturnType[]>;
}

const getGridSpan = (consensusType: Application["consensusType"]) => {
    switch (consensusType) {
        case "PRT":
            return { base: 12, xs: 6, sm: 4 };
        default:
            return { base: 12, xs: 6 };
    }
};

export const ApplicationSummaryPage: FC<Props> = ({
    application,
    epochs,
    inputs,
    outputs,
    reports,
    tournaments,
    withdrawals,
}) => {
    const appId = application.name ?? application.applicationAddress;
    const latestTournament = head(tournaments.data);
    const epochsUrls = pathBuilder.epochs({ application: appId });
    const gridSpan = getGridSpan(application.consensusType);
    const appIsForeclosed = isForeclosed(application);
    const showWithdrawalsData = appIsForeclosed;

    const tournamentUrl =
        latestTournament !== undefined
            ? pathBuilder.tournament({
                  application: appId,
                  epochIndex: latestTournament.epochIndex,
                  tournamentAddress: latestTournament.address,
              })
            : null;
    return (
        <Stack gap="xl">
            <PageTitle Icon={TbStack2} title="Summary" />
            <Grid gutter="sm">
                <Grid.Col span={gridSpan} mb="sm">
                    <SummaryCard
                        title="Epochs"
                        value={epochs.totalCount}
                        icon={TbClock}
                        displaySkeleton={epochs.isLoading}
                    />
                </Grid.Col>
                <Grid.Col span={gridSpan} mb="sm">
                    <SummaryCard
                        title="Inputs"
                        value={inputs.totalCount}
                        icon={TbInbox}
                        displaySkeleton={inputs.isLoading}
                    />
                </Grid.Col>

                <Grid.Col span={gridSpan} mb="sm">
                    <SummaryCard
                        title="Outputs"
                        value={outputs.totalCount}
                        icon={TbMail}
                        displaySkeleton={outputs.isLoading}
                        href={pathBuilder.outputs({ application: appId })}
                    />
                </Grid.Col>
                <Grid.Col span={gridSpan} mb="sm">
                    <SummaryCard
                        title="Reports"
                        value={reports.totalCount}
                        icon={TbMessageReport}
                        displaySkeleton={reports.isLoading}
                    />
                </Grid.Col>

                <Activity mode={showWithdrawalsData ? "visible" : "hidden"}>
                    <Grid.Col span={gridSpan} mb="sm">
                        <SummaryCard
                            title="Withdrawals"
                            value={withdrawals.totalCount}
                            icon={TbTransferOut}
                            displaySkeleton={withdrawals.isLoading}
                        />
                    </Grid.Col>
                </Activity>

                <Activity
                    mode={
                        application.consensusType === "PRT"
                            ? "visible"
                            : "hidden"
                    }
                >
                    <Grid.Col span={gridSpan} mb="sm">
                        <SummaryCard
                            title="Tournaments"
                            value={tournaments.totalCount}
                            icon={TbTrophy}
                            displaySkeleton={tournaments.isLoading}
                        />
                    </Grid.Col>
                </Activity>
            </Grid>

            {appIsForeclosed && (
                <ApplicationForecloseStatus application={application} />
            )}

            {tournamentUrl && (
                <Stack>
                    <Title c="dimmed" order={3}>
                        Active Tournament
                    </Title>
                    <Card>
                        <Group justify="space-between">
                            <Address
                                value={latestTournament?.address ?? "0x"}
                                href={tournamentUrl ?? ""}
                                icon
                                shorten
                                canCopy={false}
                            />
                            <Text>Epoch #{latestTournament?.epochIndex}</Text>
                        </Group>
                    </Card>
                </Stack>
            )}

            {showWithdrawalsData && (
                <Stack>
                    <Group justify="space-between" align="baseline">
                        <Title order={3} c="dimmed">
                            Latest Withdrawals
                        </Title>
                        {withdrawals.totalCount > 0 && (
                            <Anchor
                                component={Link}
                                href={pathBuilder.withdrawals({
                                    application: appId,
                                })}
                            >
                                <Text tt="uppercase" fw="bold" size="sm">
                                    view all withdrawals
                                </Text>
                            </Anchor>
                        )}
                    </Group>
                    {withdrawals.isLoading ? (
                        <CenteredText
                            key="checking-withdrawals-txt"
                            text="checking latest withdrawals..."
                        />
                    ) : isNilOrEmpty(withdrawals.data) ? (
                        <CenteredText
                            key="no-withdrawals-txt"
                            text="no withdrawals."
                        />
                    ) : (
                        <WithdrawalList
                            key={`${appId}-latest-withdrawals-${withdrawals.data.length}`}
                            withdrawals={withdrawals.data}
                        />
                    )}
                </Stack>
            )}

            <Stack>
                <Group justify="space-between" align="baseline">
                    <Title order={3} c="dimmed">
                        Latest Epochs
                    </Title>
                    <Anchor component={Link} href={epochsUrls}>
                        <Text tt="uppercase" fw="bold" size="sm">
                            view all epochs
                        </Text>
                    </Anchor>
                </Group>
                {epochs.isLoading ? (
                    <CenteredText
                        key="checking-epochs-txt"
                        text="checking latest epochs..."
                    />
                ) : isNilOrEmpty(epochs.data) ? (
                    <CenteredText key="no-epochs-txt" text="no epochs." />
                ) : (
                    <EpochList
                        key={`${appId}-latest-epochs-${epochs.data.length}`}
                        epochs={epochs.data}
                    />
                )}
            </Stack>

            <Stack>
                <Title order={3} c="dimmed">
                    Latest Inputs
                </Title>

                {inputs.isLoading ? (
                    <CenteredText
                        key="checking-inputs-txt"
                        text="checking latest inputs..."
                    />
                ) : isNilOrEmpty(inputs.data) ? (
                    <CenteredText key="no-inputs-txt" text="no inputs." />
                ) : (
                    <InputList
                        key={`${appId}-latest-inputs-${inputs.data.length}`}
                        inputs={inputs.data}
                    />
                )}
            </Stack>
        </Stack>
    );
};
