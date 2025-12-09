import type { Tournament } from "@cartesi/viem";
import {
    Button,
    Group,
    Paper,
    Stack,
    useComputedColorScheme,
    useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type FC } from "react";
import { TbTrendingDown } from "react-icons/tb";
import type { ParamsOf } from "../../../.next/types/routes";
import { CycleRangeFormatted } from "../CycleRangeFormatted";
import type { Claim, CycleRange } from "../types";
import { ClaimTimelineItem } from "./ClaimTimelineItem";

export interface SubTournamentItemProps {
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
    timestamp: number;

    /**
     * Level of the sub tournament
     */
    tournament: Tournament;
}

export const SubTournamentItem: FC<SubTournamentItemProps> = (props) => {
    const { claim, now, range, timestamp, tournament } = props;
    const params =
        useParams<ParamsOf<"/apps/[application]/epochs/[epochIndex]">>();
    const url = `/apps/${params.application}/epochs/${params.epochIndex}/tournaments/${tournament.address}`;
    const theme = useMantineTheme();
    const scheme = useComputedColorScheme();
    const bg = scheme === "light" ? theme.colors.gray[0] : undefined;
    const labels = ["none", "middle", "bottom"];

    return (
        <ClaimTimelineItem claim={claim} now={now} timestamp={timestamp}>
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
            </Paper>
        </ClaimTimelineItem>
    );
};
