import type { Commitment, Match, Tournament } from "@cartesi/client";
import { Stack } from "@mantine/core";
import type { FC } from "react";
import { TbTrophyFilled } from "react-icons/tb";
import PageTitle from "../components/layout/PageTitle";
import { TournamentView } from "../components/tournament/TournamentView";
import type { BondRecoveredEvent } from "../lib/bondUtils";

export interface TournamentPageProps {
    /**
     * The event that recovered the tournament bond, once recovered.
     */
    bondRecovery?: BondRecoveredEvent;

    /**
     * The list of all commitments.
     */
    commitments: Commitment[];

    /**
     * The matches to display.
     */
    matches: Match[];

    /**
     * Tournament to display.
     */
    tournament: Tournament;
}

export const TournamentPage: FC<TournamentPageProps> = (props) => {
    const { bondRecovery, commitments, matches, tournament } = props;
    return (
        <Stack>
            <PageTitle Icon={TbTrophyFilled} title="Tournament" />
            <TournamentView
                bondRecovery={bondRecovery}
                commitments={commitments}
                matches={matches}
                tournament={tournament}
            />
        </Stack>
    );
};
