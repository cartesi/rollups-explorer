import type { BondEvent, Commitment, Match, Tournament } from "@cartesi/client";
import {
    Card,
    Center,
    Divider,
    Group,
    Stack,
    Switch,
    Text,
    Title,
} from "@mantine/core";
import { isEmpty } from "ramda";
import { useState, type FC } from "react";
import { content } from "../../content";
import { isBondRecovery } from "../../lib/bondUtils";
import { getTournamentCycleRange } from "../../lib/prtUtils";
import { BondLedger } from "../bond/BondLedger";
import { BondRecoveryCard } from "../bond/BondRecoveryCard";
import { CycleRangeFormatted } from "../CycleRangeFormatted";
import { TournamentBreadcrumbSegment } from "../navigation/TournamentBreadcrumbSegment";
import { TournamentOutcome } from "./TournamentOutcome";
import { TournamentTable } from "./TournamentTable";

export interface TournamentViewProps {
    /**
     * Bond refund and recovery events of the tournament.
     */
    bondEvents?: BondEvent[];

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
    const { bondEvents = [], commitments, matches, tournament } = props;

    const [hideWinners, setHideWinners] = useState(false);
    const noCommitments = isEmpty(commitments);

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
                <Text>{content.tournament.cycleRangeTxt}</Text>
                <CycleRangeFormatted
                    range={getTournamentCycleRange(tournament)}
                />
            </Group>
            <TournamentOutcome snapshot={tournament.snapshot} />
            <BondRecoveryCard
                bondRecovery={tournament.snapshot.bondRecovery}
                recovery={bondEvents.find(isBondRecovery)}
            />
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
                candidate={tournament.snapshot.candidate}
                matches={matches}
                hideWinners={hideWinners}
            />
            {noCommitments && (
                <Card>
                    <Center>
                        <Title order={3}>No claims submitted</Title>
                    </Center>
                </Card>
            )}
            <Divider label={content.tournament.bondEventsTxt} />
            <BondLedger events={bondEvents} />
        </Stack>
    );
};
