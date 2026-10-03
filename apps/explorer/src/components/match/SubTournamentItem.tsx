import type { Tournament } from "@cartesi/client";
import {
    Box,
    Button,
    Group,
    Paper,
    Stack,
    useComputedColorScheme,
    useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type FC, type ReactNode } from "react";
import { TbTrendingDown } from "react-icons/tb";
import type { ParamsOf } from "../../../.next/types/routes";
import { CycleRangeFormatted } from "../CycleRangeFormatted";
import type { Claim, CycleRange } from "../types";
import { ClaimTimelineItem } from "./ClaimTimelineItem";

export interface SubTournamentItemProps {
    /**
     * Call settling the parent match once the sub tournament finished.
     */
    action?: ReactNode;

    /**
     * Claim that took action.
     */
    claim: Claim;

    /**
     * Current timestamp
     */
    now: number;

    /**
     * Cycle range
     */
    range: CycleRange;

    /**
     * Timestamp
     */
    timestamp?: number;

    /**
     * Whether the timestamp is still being resolved.
     */
    timestampLoading?: boolean;

    /**
     * Level of the sub tournament
     */
    tournament: Tournament;
}

export const SubTournamentItem: FC<SubTournamentItemProps> = (props) => {
    const {
        action,
        claim,
        now,
        range,
        timestamp,
        timestampLoading,
        tournament,
    } = props;
    const params =
        useParams<ParamsOf<"/apps/[application]/epochs/[epochIndex]">>();
    const url = `/apps/${params.application}/epochs/${params.epochIndex}/tournaments/${tournament.address}`;
    const theme = useMantineTheme();
    const scheme = useComputedColorScheme();
    const bg = scheme === "light" ? theme.colors.gray[0] : undefined;
    const labels = ["none", "middle", "bottom"];

    return (
        <ClaimTimelineItem
            claim={claim}
            now={now}
            timestamp={timestamp}
            timestampLoading={timestampLoading}
        >
            <Paper withBorder radius="lg" p={16} bg={bg}>
                <Group justify="space-between">
                    <Stack gap="xs">
                        <CycleRangeFormatted size="xs" range={range} />
                    </Stack>
                    <Button
                        component={Link}
                        href={url}
                        rightSection={<TbTrendingDown />}
                    >
                        {labels[Number(tournament.level)] ?? "none"}
                    </Button>
                </Group>
                {action && <Box mt="sm">{action}</Box>}
            </Paper>
        </ClaimTimelineItem>
    );
};
