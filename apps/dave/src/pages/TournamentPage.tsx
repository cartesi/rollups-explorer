import type { Commitment, Match, Tournament } from "@cartesi/viem";
import { Stack } from "@mantine/core";
import type { FC } from "react";
import { TbTrophyFilled } from "react-icons/tb";
import PageTitle from "../components/layout/PageTitle";
import { TournamentView } from "../components/tournament/TournamentView";

export interface TournamentPageProps {
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
    const { commitments, matches, tournament } = props;
    return (
        <Stack>
            <PageTitle Icon={TbTrophyFilled} title="Tournament" />
            <TournamentView
                commitments={commitments}
                matches={matches}
                tournament={tournament}
            />
        </Stack>
    );
};
