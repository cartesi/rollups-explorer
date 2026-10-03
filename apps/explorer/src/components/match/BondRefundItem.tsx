import { Stack, Text } from "@mantine/core";
import type { FC } from "react";
import type { Depositor, PartialBondRefundEvent } from "../../lib/bondUtils";
import { BondRefund } from "../bond/BondRefund";
import { ClaimTimelineItem } from "./ClaimTimelineItem";

export interface BondRefundItemProps {
    /**
     * Accounts that deposited the bonds of the match claims.
     */
    depositors?: Depositor[];

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
    const { depositors, label, now, refund } = props;

    return (
        <ClaimTimelineItem now={now}>
            <Stack gap={2}>
                <Text size="sm">{label}</Text>
                <BondRefund depositors={depositors} refund={refund} />
            </Stack>
        </ClaimTimelineItem>
    );
};
