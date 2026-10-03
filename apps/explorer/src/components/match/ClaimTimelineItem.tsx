import {
    Group,
    Skeleton,
    Stack,
    Text,
    Timeline,
    type TimelineItemProps,
} from "@mantine/core";
import humanizeDuration from "humanize-duration";
import { forwardRef } from "react";
import { HashAvatar } from "../HashAvatar";
import type { Claim } from "../types";

export interface ClaimTimelineItemProps extends TimelineItemProps {
    /**
     * The claim to display.
     */
    claim?: Claim;

    /**
     * The current timestamp.
     */
    now: number;

    /**
     * The component to show to the right of the timestamp.
     */
    rightSection?: React.ReactNode;

    /**
     * The timestamp to display.
     */
    timestamp?: number;

    /**
     * Whether the timestamp is still being resolved.
     */
    timestampLoading?: boolean;
}

const formatTime = (now: number, timestamp: number) => {
    return `${humanizeDuration(now - timestamp, { units: ["h", "m", "s"], round: true })} ago`;
};

export const ClaimTimelineItem = forwardRef<
    HTMLDivElement,
    ClaimTimelineItemProps
>((props, ref) => {
    const { children, claim, now, rightSection, timestamp, timestampLoading } =
        props;
    const time = timestamp ? (
        <Text size="xs" c="dimmed">
            {formatTime(now, timestamp)}
        </Text>
    ) : timestampLoading ? (
        <Skeleton h={10} w={72} radius="xl" data-testid="timestamp-loading" />
    ) : null;
    return (
        <Timeline.Item
            bullet={
                claim ? <HashAvatar hash={claim.hash} size={24} /> : undefined
            }
            ref={ref}
        >
            <Stack gap={3}>
                {(time || rightSection) && (
                    <Group justify={time ? "space-between" : "flex-end"}>
                        {time}
                        {rightSection}
                    </Group>
                )}
                {children}
            </Stack>
        </Timeline.Item>
    );
});
