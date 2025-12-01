import {
    Badge,
    Group,
    Stack,
    Switch,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { isEmpty } from "ramda";
import { useState, type FC } from "react";
import { TbTrophyFilled } from "react-icons/tb";
import { CycleRangeFormatted } from "../CycleRangeFormatted";
import { LongText } from "../LongText";
import { TournamentBreadcrumbSegment } from "../navigation/TournamentBreadcrumbSegment";
import type { Tournament } from "../types";
import { TournamentNoClaims } from "./TournamentNoClaims";
import { TournamentStatusTooltip } from "./TournamentStatusTooltip";
import { TournamentTable } from "./TournamentTable";

export interface TournamentViewProps {
    /**
     * The tournament to display.
     */
    tournament: Tournament;
}

export const TournamentView: FC<TournamentViewProps> = (props) => {
    const { tournament } = props;

    const theme = useMantineTheme();
    const gold = theme.colors.yellow[5];

    const { danglingClaim, endCycle, matches, startCycle, winner } = tournament;
    const [hideWinners, setHideWinners] = useState(false);
    const hasClaims = danglingClaim !== undefined || !isEmpty(matches);

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
                <Group gap={3}>
                    <Text>Status</Text>
                    <TournamentStatusTooltip status={tournament.status} />
                </Group>
                <Badge variant="filled" color={tournament.status.toLowerCase()}>
                    {tournament.status}
                </Badge>
            </Group>
            <Group>
                <Text>Mcycle range</Text>
                <CycleRangeFormatted range={[startCycle, endCycle]} />
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

            {hasClaims ? (
                <TournamentTable
                    danglingClaim={danglingClaim}
                    matches={matches}
                    hideWinners={hideWinners}
                />
            ) : (
                <TournamentNoClaims status={tournament.status} />
            )}
        </Stack>
    );
};
