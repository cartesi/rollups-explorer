import type {
    Commitment,
    Match,
    MatchAdvanced,
    Tournament,
} from "@cartesi/client";
import { Divider, Group, Stack, Text } from "@mantine/core";
import { type FC } from "react";
import { getTournamentCycleRange } from "../../lib/prtUtils";
import { ClaimText } from "../ClaimText";
import { CycleRangeFormatted } from "../CycleRangeFormatted";
import { MatchActions } from "./MatchActions";
import { MatchState } from "./MatchState";

export interface MatchViewProps {
    /**
     * List of advances (bisections) of the match
     */
    advances: MatchAdvanced[];

    /**
     * Current snapshots of the two match commitments.
     */
    commitments?: Commitment[];

    /**
     * The match to display.
     */
    match: Match;

    /**
     * The sub tournament to display.
     */
    subTournament?: Tournament;

    /**
     * The parent Tournament
     */
    tournament: Tournament;

    /**
     * The current timestamp.
     */
    now: number;

    /**
     * Timestamps in milliseconds of the blocks the match events happened in.
     */
    timestamps?: Map<bigint, number>;

    /**
     * Whether the block timestamps are still being fetched.
     */
    timestampsLoading?: boolean;
}

export const MatchView: FC<MatchViewProps> = (props) => {
    const {
        advances,
        commitments,
        tournament,
        match,
        subTournament,
        now,
        timestamps,
        timestampsLoading,
    } = props;
    const claim1 = { hash: match.commitmentOne };
    const claim2 = { hash: match.commitmentTwo };

    return (
        <Stack>
            <Group>
                <Text>Cycle range</Text>
                <CycleRangeFormatted
                    range={getTournamentCycleRange(tournament)}
                />
            </Group>
            <Group>
                <Text>Claims</Text>
                <Group gap="xs">
                    <ClaimText claim={claim1} />
                    <Text>vs</Text>
                    <ClaimText claim={claim2} />
                </Group>
            </Group>
            <MatchState
                commitments={commitments}
                match={match}
                tournament={tournament}
            />
            <Divider label="Actions" />
            <MatchActions
                advances={advances}
                match={match}
                now={now}
                subTournament={subTournament}
                timestamps={timestamps}
                timestampsLoading={timestampsLoading}
                tournament={tournament}
            />
        </Stack>
    );
};
