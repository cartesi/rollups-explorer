import type {
    Commitment,
    Match,
    MatchAdvanced,
    Tournament,
} from "@cartesi/client";
import { Stack } from "@mantine/core";
import type { FC } from "react";
import { TbSwords } from "react-icons/tb";
import PageTitle from "../components/layout/PageTitle";
import { MatchView } from "../components/match/MatchView";

export interface MatchPageProps {
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
     * The tournament to display.
     */
    tournament: Tournament;

    /**
     * The current timestamp.
     */
    now: number;
}

export const MatchPage: FC<MatchPageProps> = (props) => {
    const { advances, commitments, tournament, match, subTournament, now } =
        props;

    return (
        <Stack>
            <PageTitle Icon={TbSwords} title="Match" />
            <MatchView
                advances={advances}
                commitments={commitments}
                match={match}
                now={now}
                subTournament={subTournament}
                tournament={tournament}
            />
        </Stack>
    );
};
