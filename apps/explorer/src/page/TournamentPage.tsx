import type { BondEvent, Commitment, Match, Tournament } from "@cartesi/client";
import { Stack } from "@mantine/core";
import type { FC } from "react";
import { TbTrophyFilled } from "react-icons/tb";
import PageTitle from "../components/layout/PageTitle";
import {
    TournamentView,
    type TournamentBondPool,
} from "../components/tournament/TournamentView";

export interface TournamentPageProps {
    /**
     * Bond refund and recovery events of the tournament.
     */
    bondEvents?: BondEvent[];

    /**
     * Bonds deposited into the tournament and its balance.
     */
    bondPool?: TournamentBondPool;

    /**
     * The list of all commitments.
     */
    commitments: Commitment[];

    /**
     * Called once a bond recovery sent from the page is confirmed.
     */
    onBondRecovered?: () => void;

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
    const {
        bondEvents,
        bondPool,
        commitments,
        matches,
        onBondRecovered,
        tournament,
    } = props;
    return (
        <Stack>
            <PageTitle Icon={TbTrophyFilled} title="Tournament" />
            <TournamentView
                bondEvents={bondEvents}
                bondPool={bondPool}
                onBondRecovered={onBondRecovered}
                commitments={commitments}
                matches={matches}
                tournament={tournament}
            />
        </Stack>
    );
};
