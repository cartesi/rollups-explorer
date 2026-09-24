import type { BondEvent } from "@cartesi/client";
import { Anchor, Badge, Card, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";
import type { FC, ReactNode } from "react";
import { TbCoins } from "react-icons/tb";
import Address from "../components/Address";
import PageTitle from "../components/layout/PageTitle";
import { LongText } from "../components/LongText";
import TransactionHash from "../components/TransactionHash";
import { content } from "../content";
import { formatBondValue, isBondRecovery } from "../lib/bondUtils";
import { pathBuilder } from "../routes/routePathBuilder";

const text = content.bond.event;

export interface BondEventPageProps {
    application: string;
    event: BondEvent;
}

const Field: FC<{ label: string; children: ReactNode }> = ({
    label,
    children,
}) => (
    <Group>
        <Text w={140} c="dimmed">
            {label}
        </Text>
        {children}
    </Group>
);

export const BondEventPage: FC<BondEventPageProps> = ({
    application,
    event,
}) => (
    <Stack>
        <PageTitle Icon={TbCoins} title={text.titleTxt} />
        <Card withBorder>
            <Stack gap="sm">
                <Field label={text.typeTxt}>
                    {isBondRecovery(event) ? (
                        <Badge color="green">{text.bondRecoveredTxt}</Badge>
                    ) : (
                        <Badge color={event.refund.success ? "blue" : "red"}>
                            {event.refund.success
                                ? text.gasRefundTxt
                                : text.gasRefundNotPaidTxt}
                        </Badge>
                    )}
                </Field>
                <Field label={text.tournamentTxt}>
                    <Anchor
                        component={Link}
                        href={pathBuilder.tournament({
                            application,
                            epochIndex: event.epochIndex,
                            tournamentAddress: event.tournamentAddress,
                        })}
                    >
                        {`${text.epochTxt}${event.epochIndex}`}
                    </Anchor>
                    <Address value={event.tournamentAddress} shorten />
                </Field>
                <Field label={text.blockTxt}>
                    <Text>{event.blockNumber.toString()}</Text>
                </Field>
                <Field label={text.transactionTxt}>
                    <TransactionHash transactionHash={event.txHash} />
                </Field>
                <Field label={text.logIndexTxt}>
                    <Text>{event.logIndex.toString()}</Text>
                </Field>
                {isBondRecovery(event) ? (
                    <>
                        <Field label={text.commitmentTxt}>
                            <LongText
                                value={event.recovery.commitment}
                                ff="monospace"
                            />
                        </Field>
                        <Field label={text.claimerTxt}>
                            <Address value={event.recovery.claimer} />
                        </Field>
                        <Field label={text.paidTxt}>
                            <Text>
                                {formatBondValue(event.recovery.payment)}
                            </Text>
                        </Field>
                        <Field label={text.burnedTxt}>
                            <Text>
                                {formatBondValue(event.recovery.burned)}
                            </Text>
                        </Field>
                    </>
                ) : (
                    <>
                        <Field label={text.recipientTxt}>
                            <Address value={event.refund.recipient} />
                        </Field>
                        <Field
                            label={
                                event.refund.success
                                    ? text.refundedTxt
                                    : text.requestedTxt
                            }
                        >
                            <Text>{formatBondValue(event.refund.value)}</Text>
                        </Field>
                    </>
                )}
            </Stack>
        </Card>
    </Stack>
);
