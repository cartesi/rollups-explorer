import type {
    Application,
    GetEpochReturnType,
    GetInputReturnType,
    GetTournamentReturnType,
    GetWithdrawalReturnType,
} from "@cartesi/client";
import { Anchor, Card, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { head } from "ramda";
import { isNilOrEmpty } from "ramda-adjunct";
import { type FC } from "react";
import {
    TbClock,
    TbCoins,
    TbInbox,
    TbMail,
    TbMessageReport,
    TbReceiptRefund,
    TbStack2,
    TbTransferOut,
    TbTrophy,
} from "react-icons/tb";
import Address from "../components/Address";
import { ApplicationForecloseStatus } from "../components/application/ApplicationForecloseStatus";
import {
    SummaryCards,
    type CardsPerRow,
} from "../components/application/SummaryCards";
import { isForeclosed } from "../components/application/utils";
import CenteredText from "../components/CenteredText";
import { EpochList } from "../components/epoch/EpochList";
import { InputList } from "../components/input/InputList";
import PageTitle from "../components/layout/PageTitle";
import {
    RefundableDeposits,
    type RefundableDeposit,
} from "../components/refund/RefundableDeposits";
import type { SummaryCardProps } from "../components/SummaryCard";
import { WithdrawalList } from "../components/withdrawal/WithdrawalList";
import { content } from "../content";
import { pathBuilder } from "../routes/routePathBuilder";

type OmitNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] };

type Meta<T> = OmitNever<{
    totalCount: number;
    data: T extends never ? never : T;
    isLoading: boolean;
    /**
     * Refreshes the source of this block, when the container has one.
     */
    refetch?: () => void;
}>;

interface Props {
    application: Application;
    bondEvents: Meta<never>;
    inputs: Meta<GetInputReturnType[]>;
    epochs: Meta<GetEpochReturnType[]>;
    withdrawals: Meta<GetWithdrawalReturnType[]>;

    /**
     * Deposit refunds issued by the application. Shown only for a
     * foreclosed application.
     */
    refunds: Meta<never>;
    outputs: Meta<never>;
    reports: Meta<never>;
    tournaments: Meta<GetTournamentReturnType[]>;

    /**
     * Deposits of epochs not finalized before foreclosure. Shown only for a
     * foreclosed application, and only when there is something to refund.
     */
    refundableDeposits?: Meta<RefundableDeposit[]>;
}

const getCardsPerRow = (
    consensusType: Application["consensusType"],
): CardsPerRow => {
    switch (consensusType) {
        case "PRT":
            return { base: 1, xs: 2, sm: 3 };
        default:
            return { base: 1, xs: 2, sm: 2 };
    }
};

export const ApplicationSummaryPage: FC<Props> = ({
    application,
    bondEvents,
    epochs,
    inputs,
    outputs,
    reports,
    tournaments,
    withdrawals,
    refunds,
    refundableDeposits,
}) => {
    const appId = application.name ?? application.applicationAddress;
    const latestTournament = head(tournaments.data);
    const epochsUrls = pathBuilder.epochs({ application: appId });
    const appIsForeclosed = isForeclosed(application);
    const showWithdrawalsData = appIsForeclosed;
    const isPrt = application.consensusType === "PRT";

    // A refund issued from the latest inputs changes the refundable deposits
    // table and the Refunds counter, both rendered by this page.
    const onRefunded = () => {
        refundableDeposits?.refetch?.();
        refunds.refetch?.();
    };

    const cards: SummaryCardProps[] = [
        {
            title: "Epochs",
            value: epochs.totalCount,
            icon: TbClock,
            displaySkeleton: epochs.isLoading,
        },
        {
            title: "Inputs",
            value: inputs.totalCount,
            icon: TbInbox,
            displaySkeleton: inputs.isLoading,
        },
        {
            title: "Outputs",
            value: outputs.totalCount,
            icon: TbMail,
            displaySkeleton: outputs.isLoading,
            href: pathBuilder.outputs({ application: appId }),
        },
        {
            title: "Reports",
            value: reports.totalCount,
            icon: TbMessageReport,
            displaySkeleton: reports.isLoading,
        },
        ...(appIsForeclosed
            ? [
                  {
                      title: "Withdrawals",
                      value: withdrawals.totalCount,
                      icon: TbTransferOut,
                      displaySkeleton: withdrawals.isLoading,
                  },
                  {
                      title: content.refund.summaryCardTxt,
                      value: refunds.totalCount,
                      icon: TbReceiptRefund,
                      displaySkeleton: refunds.isLoading,
                  },
              ]
            : []),
        ...(isPrt
            ? [
                  {
                      title: "Tournaments",
                      value: tournaments.totalCount,
                      icon: TbTrophy,
                      displaySkeleton: tournaments.isLoading,
                  },
                  {
                      title: content.bond.summaryCardTxt,
                      value: bondEvents.totalCount,
                      icon: TbCoins,
                      displaySkeleton: bondEvents.isLoading,
                      href: pathBuilder.bonds({ application: appId }),
                  },
              ]
            : []),
    ];

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
            <SummaryCards
                cards={cards}
                perRow={getCardsPerRow(application.consensusType)}
            />

            {appIsForeclosed && (
                <ApplicationForecloseStatus application={application} />
            )}

            {appIsForeclosed && refundableDeposits && (
                <RefundableDeposits
                    application={application}
                    deposits={refundableDeposits.data}
                />
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
                        application={application}
                        epochStatusByIndex={
                            new Map(
                                epochs.data.map((epoch) => [
                                    epoch.index,
                                    epoch.status,
                                ]),
                            )
                        }
                        onRefunded={onRefunded}
                    />
                )}
            </Stack>
        </Stack>
    );
};
