import { Stack, Text } from "@mantine/core";
import type { FC } from "react";
import type { PartialBondRefundEvent } from "../../lib/bondUtils";
import { BondRefund } from "../bond/BondRefund";
import { ClaimTimelineItem } from "./ClaimTimelineItem";

export interface BondRefundItemProps {
    /**
     * The action the refund was paid for.
     */
    label: string;

    /**
     * Current timestamp
     */
    now: number;

    refund: PartialBondRefundEvent;
}

export const BondRefundItem: FC<BondRefundItemProps> = (props) => {
    const { label, now, refund } = props;

    return (
        <ClaimTimelineItem now={now}>
            <Stack gap={2}>
                <Text size="sm">{label}</Text>
                <BondRefund refund={refund} />
            </Stack>
        </ClaimTimelineItem>
    );
};
