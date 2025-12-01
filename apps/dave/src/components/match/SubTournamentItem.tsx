import {
    Button,
    Group,
    Paper,
    Stack,
    useComputedColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { type FC } from "react";
import { TbTrendingDown } from "react-icons/tb";
import { Link, useParams } from "react-router";
import {
    routePathBuilder,
    type MatchParams,
} from "../../routes/routePathBuilder";
import { CycleRangeFormatted } from "../CycleRangeFormatted";
import type { Claim, CycleRange } from "../types";
import { ClaimTimelineItem } from "./ClaimTimelineItem";

export interface SubTournamentItemProps {
    /**
     * Claim that took action.
     */
    claim: Claim;

    /**
     * Level of the sub tournament
     */
    level: bigint;

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
}

export const SubTournamentItem: FC<SubTournamentItemProps> = (props) => {
    const { claim, level, now, range, timestamp } = props;
    const params = useParams<MatchParams>();
    const tournamentUrl = routePathBuilder.tournament({
        application: params.application ?? "",
        epochIndex: params.epochIndex ?? "",
        tournamentAddress: params.tournamentAddress ?? "0x",
    });
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
                        to={tournamentUrl}
                        rightSection={<TbTrendingDown />}
                    >
                        {labels[Number(level)] ?? "none"}
                    </Button>
                </Group>
            </Paper>
        </ClaimTimelineItem>
    );
};
