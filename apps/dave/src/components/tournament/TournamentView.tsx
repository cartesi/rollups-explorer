import type { Commitment, Match, Tournament } from "@cartesi/viem";
import { Group, Stack, Switch, Text, useMantineTheme } from "@mantine/core";
import { useState, type FC } from "react";
import { TbTrophyFilled } from "react-icons/tb";
import { CycleRangeFormatted } from "../CycleRangeFormatted";
import { LongText } from "../LongText";
import { TournamentBreadcrumbSegment } from "../navigation/TournamentBreadcrumbSegment";
import type { CycleRange } from "../types";
import { TournamentTable } from "./TournamentTable";

export interface TournamentViewProps {
    /**
     * The list of all commitments.
     */
    commitments: Commitment[];

    /**
     * The matches to display.
     */
    matches: Match[];

    /**
     * The tournament to display.
     */
    tournament: Tournament;
}

export const TournamentView: FC<TournamentViewProps> = (props) => {
    const { commitments, matches, tournament } = props;

    const theme = useMantineTheme();
    const gold = theme.colors.yellow[5];

    // XXX: where the range is coming from?
    const range = [0, 0] as CycleRange;
    const winner = tournament.winnerCommitment
        ? { hash: tournament.winnerCommitment }
        : undefined;
    const [hideWinners, setHideWinners] = useState(false);

    return (
        <Stack>
            <Group>
                <Text>Level</Text>
                <TournamentBreadcrumbSegment
                    level={tournament.level}
                    variant="filled"
                />
            </Group>
            <Group>
                <Text>Mcycle range</Text>
                <CycleRangeFormatted range={range} />
            </Group>
            <Group>
                <Text>Winner</Text>
                {!winner && <TbTrophyFilled size={24} color="lightgray" />}
                {winner && (
                    <Group gap="xs">
                        <TbTrophyFilled size={24} color={gold} />
                        <LongText value={winner.hash} ff="monospace" />
                    </Group>
                )}
            </Group>
            <Switch
                label="Show only eliminated and pending matches"
                labelPosition="left"
                size="md"
                checked={hideWinners}
                onChange={(event) =>
                    setHideWinners(event.currentTarget.checked)
                }
            />
            <TournamentTable
                matches={matches}
                commitments={commitments}
                hideWinners={hideWinners}
            />
        </Stack>
    );
};
