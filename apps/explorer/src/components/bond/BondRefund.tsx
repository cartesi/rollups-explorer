import { Badge, Group, Text } from "@mantine/core";
import type { FC } from "react";
import { TbCoins } from "react-icons/tb";
import { isAddressEqual, type Address as EthAddress } from "viem";
import {
    formatBondValue,
    type Depositor,
    type PartialBondRefundEvent,
} from "../../lib/bondUtils";
import { content } from "../../content";
import Address from "../Address";
import { HashAvatar } from "../HashAvatar";
import { InfoHint } from "../InfoHint";

const text = content.bond.gasRefund;
const senderText = content.bond.refundSender;

export interface BondRefundProps {
    /**
     * Accounts that deposited the bonds of the match claims. When given, the
     * refund recipient, who sent the move, is labelled against them.
     */
    depositors?: Depositor[];

    refund: PartialBondRefundEvent;
}

const RefundSender: FC<{ depositors: Depositor[]; recipient: EthAddress }> = ({
    depositors,
    recipient,
}) => {
    const deposited = depositors.filter(({ depositor }) =>
        isAddressEqual(depositor, recipient),
    );

    return deposited.length > 0 ? (
        <Badge
            size="xs"
            variant="light"
            leftSection={deposited.map(({ commitment }) => (
                <HashAvatar key={commitment} hash={commitment} size={12} />
            ))}
        >
            {senderText.depositorTxt}
        </Badge>
    ) : (
        <>
            <Badge size="xs" variant="light" color="gray">
                {senderText.otherAccountTxt}
            </Badge>
            <InfoHint label={senderText.otherAccountHint} size={14} />
        </>
    );
};

/**
 * A partial bond refund. A failed refund records the requested value, which
 * was never paid.
 */
export const BondRefund: FC<BondRefundProps> = ({ depositors, refund }) => {
    const { recipient, success, value } = refund.refund;

    return (
        <Group gap={6} c="dimmed">
            <TbCoins size={16} />
            <Text size="xs">
                {`${success ? text.paidTxt : text.requestedTxt} ${formatBondValue(value)} ${text.toTxt}`}
            </Text>
            <Address value={recipient} iconSize={14} canCopy={false} shorten />
            <InfoHint label={text.hint} size={14} />
            {depositors && depositors.length > 0 && (
                <RefundSender depositors={depositors} recipient={recipient} />
            )}
            {!success && (
                <>
                    <Badge size="xs" color="red">
                        {text.notPaidTxt}
                    </Badge>
                    <InfoHint label={text.notPaidHint} size={14} />
                </>
            )}
        </Group>
    );
};
