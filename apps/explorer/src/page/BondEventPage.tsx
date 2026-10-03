import type { BondEvent } from "@cartesi/client";
import { Anchor, Badge, Card, Stack, Text } from "@mantine/core";
import Link from "next/link";
import type { FC } from "react";
import { TbCoins } from "react-icons/tb";
import Address from "../components/Address";
import { DetailRow } from "../components/DetailRow";
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

export const BondEventPage: FC<BondEventPageProps> = ({
    application,
    event,
}) => (
    <Stack>
        <PageTitle Icon={TbCoins} title={text.titleTxt} />
        <Card withBorder>
            <Stack gap="sm">
                <DetailRow
                    label={text.typeTxt}
                    hint={
                        isBondRecovery(event)
                            ? undefined
                            : content.bond.gasRefund.hint
                    }
                >
                    {isBondRecovery(event) ? (
                        <Badge color="green">{text.bondRecoveredTxt}</Badge>
                    ) : (
                        <Badge color={event.refund.success ? "blue" : "red"}>
                            {event.refund.success
                                ? text.gasRefundTxt
                                : text.gasRefundNotPaidTxt}
                        </Badge>
                    )}
                </DetailRow>
                <DetailRow label={text.tournamentTxt}>
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
                </DetailRow>
                <DetailRow label={text.blockTxt}>
                    <Text>{event.blockNumber.toString()}</Text>
                </DetailRow>
                <DetailRow label={text.transactionTxt}>
                    <TransactionHash transactionHash={event.txHash} />
                </DetailRow>
                <DetailRow label={text.logIndexTxt}>
                    <Text>{event.logIndex.toString()}</Text>
                </DetailRow>
                {isBondRecovery(event) ? (
                    <>
                        <DetailRow label={text.commitmentTxt}>
                            <LongText
                                value={event.recovery.commitment}
                                ff="monospace"
                            />
                        </DetailRow>
                        <DetailRow label={text.claimerTxt}>
                            <Address value={event.recovery.claimer} />
                        </DetailRow>
                        <DetailRow label={text.paidTxt}>
                            <Text>
                                {formatBondValue(event.recovery.payment)}
                            </Text>
                        </DetailRow>
                        <DetailRow label={text.burnedTxt}>
                            <Text>
                                {formatBondValue(event.recovery.burned)}
                            </Text>
                        </DetailRow>
                    </>
                ) : (
                    <>
                        <DetailRow label={text.recipientTxt}>
                            <Address value={event.refund.recipient} />
                        </DetailRow>
                        <DetailRow
                            label={
                                event.refund.success
                                    ? text.refundedTxt
                                    : text.requestedTxt
                            }
                        >
                            <Text>{formatBondValue(event.refund.value)}</Text>
                        </DetailRow>
                    </>
                )}
            </Stack>
        </Card>
    </Stack>
);
