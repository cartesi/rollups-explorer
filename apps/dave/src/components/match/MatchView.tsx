import type { Match, MatchAdvanced, Tournament } from "@cartesi/viem";
import { Divider, Group, Stack, Text } from "@mantine/core";
import { type FC } from "react";
import { ClaimText } from "../ClaimText";
import { CycleRangeFormatted } from "../CycleRangeFormatted";
import type { CycleRange } from "../types";
import { MatchActions } from "./MatchActions";

export interface MatchViewProps {
    /**
     * List of advances (bisections) of the match
     */
    advances: MatchAdvanced[];

    /**
     * The match to display.
     */
    match: Match;

    /**
     * The parent Tournament
     */
    tournament: Tournament;

    /**
     * The current timestamp.
     */
    now: number;

    /**
     * The cycle range of the match tournament.
     */
    range: CycleRange;
}

export const MatchView: FC<MatchViewProps> = (props) => {
    const { advances, tournament, match, now, range } = props;
    const claim1 = { hash: match.commitmentOne };
    const claim2 = { hash: match.commitmentTwo };
    const { height } = tournament;

    const nextLevel = tournament.level + 1n;

    return (
        <Stack>
            <Group>
                <Text>Mcycle range</Text>
                <CycleRangeFormatted range={range} />
            </Group>
            <Group>
                <Text>Claims</Text>
                <Group gap="xs">
                    <ClaimText claim={claim1} />
                    <Text>vs</Text>
                    <ClaimText claim={claim2} />
                </Group>
            </Group>
            <Divider label="Actions" />
            <MatchActions
                advances={advances}
                height={height}
                match={match}
                nextLevel={nextLevel}
                now={now}
            />
        </Stack>
    );
};
