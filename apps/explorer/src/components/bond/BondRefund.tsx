import { Badge, Group, Text } from "@mantine/core";
import type { FC } from "react";
import { TbCoins } from "react-icons/tb";
import {
    formatBondValue,
    type PartialBondRefundEvent,
} from "../../lib/bondUtils";
import { content } from "../../content";
import Address from "../Address";
import { InfoHint } from "../InfoHint";

const text = content.bond.gasRefund;

export interface BondRefundProps {
    refund: PartialBondRefundEvent;
}

/**
 * A partial bond refund. A failed refund records the requested value, which
 * was never paid.
 */
export const BondRefund: FC<BondRefundProps> = ({ refund }) => {
    const { recipient, success, value } = refund.refund;

    return (
        <Group gap={6} c="dimmed">
            <TbCoins size={16} />
            <Text size="xs">
                {`${success ? text.paidTxt : text.requestedTxt} ${formatBondValue(value)} ${text.toTxt}`}
            </Text>
            <Address value={recipient} iconSize={14} canCopy={false} shorten />
            <InfoHint label={text.hint} size={14} />
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
