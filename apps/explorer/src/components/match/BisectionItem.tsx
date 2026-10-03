import { Stack, Text, type TimelineItemProps } from "@mantine/core";
import { forwardRef, useMemo, type FC } from "react";
import type { Depositor, PartialBondRefundEvent } from "../../lib/bondUtils";
import { toRatio } from "../../util";
import { BondRefund } from "../bond/BondRefund";
import type { Claim, CycleRange } from "../types";
import { ClaimTimelineItem } from "./ClaimTimelineItem";
import { CurlyBracket } from "./CurlyBracket";
import { RangeIndicator } from "./RangeIndicator";

export interface BisectionItemProps extends TimelineItemProps {
    /**
     * Claim that performed the bisection
     */
    claim: Claim;

    /**
     * Accounts that deposited the bonds of the match claims.
     */
    depositors?: Depositor[];

    /**
     * Domain of the bisection
     */
    domain: CycleRange;

    /**
     * Whether to expand the bisection to a full range
     */
    expand?: boolean;

    /**
     * Index of the bisection
     */
    index: number;

    /**
     * Current timestamp
     */
    now: number;

    /**
     * Range of the bisection
     */
    range: CycleRange;

    /**
     * Bond refund paid for the bisection
     */
    refund?: PartialBondRefundEvent;

    /**
     * Timestamp of the bisection
     */
    timestamp?: number;

    /**
     * Whether the timestamp is still being resolved.
     */
    timestampLoading?: boolean;

    /**
     * Total number of bisections
     */
    total: number;
}

const BisectionItem: FC<BisectionItemProps> = forwardRef<
    HTMLDivElement,
    BisectionItemProps
>((props, ref) => {
    const {
        claim,
        depositors,
        domain,
        expand,
        index,
        now,
        range,
        refund,
        timestamp,
        timestampLoading,
        total,
    } = props;

    // percentage of the middle of the range relative to the bar
    const p = useMemo(() => {
        const [start, end] = range;
        const [domainStart, domainEnd] = domain;
        return toRatio(
            start + end - 2n * domainStart,
            2n * (domainEnd - domainStart),
        );
    }, [domain, range]);

    return (
        <ClaimTimelineItem
            claim={claim}
            now={now}
            ref={ref}
            rightSection={
                <Text size="xs" c="dimmed">
                    {index} / {total}
                </Text>
            }
            timestamp={timestamp}
            timestampLoading={timestampLoading}
        >
            <Stack gap="xs">
                <RangeIndicator
                    domain={domain}
                    value={range}
                    h={16}
                    color={props.color}
                />
                {expand && (
                    <>
                        <CurlyBracket
                            color={props.color}
                            h={14}
                            strokeWidth={2}
                            tip={p}
                        />
                        <RangeIndicator
                            domain={[0n, 1n]}
                            value={[0n, 1n]}
                            h={16}
                            color={props.color}
                        />
                    </>
                )}
                {refund && (
                    <BondRefund depositors={depositors} refund={refund} />
                )}
            </Stack>
        </ClaimTimelineItem>
    );
});

BisectionItem.displayName = "BisectionItem";

export { BisectionItem };
