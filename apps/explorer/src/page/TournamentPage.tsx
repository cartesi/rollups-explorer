import type { BondEvent, Commitment, Match, Tournament } from "@cartesi/client";
import { Stack } from "@mantine/core";
import type { FC } from "react";
import { TbTrophyFilled } from "react-icons/tb";
import PageTitle from "../components/layout/PageTitle";
import {
    TournamentView,
    type TournamentBondPool,
    type TournamentParentMatch,
    type TournamentTab,
} from "../components/tournament/TournamentView";
import useUpdateQueryString from "../hooks/useUpdateQueryString";

export interface TournamentPageProps {
    /**
     * Bond refund and recovery events of the tournament.
     */
    bondEvents?: BondEvent[];

    /**
     * Total bond events of the tournament, as reported by the node.
     */
    bondEventsTotal?: number;

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
     * Total matches of the tournament, as reported by the node.
     */
    matchesTotal?: number;

    /**
     * Parent match of an inner tournament, to settle it once finished.
     */
    parent?: TournamentParentMatch;

    /**
     * The selected tab, kept in the URL.
     */
    tab?: TournamentTab;

    /**
     * Tournament to display.
     */
    tournament: Tournament;
}

export const TournamentPage: FC<TournamentPageProps> = (props) => {
    const {
        bondEvents,
        bondEventsTotal,
        bondPool,
        commitments,
        matches,
        matchesTotal,
        onBondRecovered,
        parent,
        tab,
        tournament,
    } = props;
    const [updateUrlQueryString] = useUpdateQueryString();
    return (
        <Stack>
            <PageTitle Icon={TbTrophyFilled} title="Tournament" />
            <TournamentView
                bondEvents={bondEvents}
                bondEventsTotal={bondEventsTotal}
                matchesTotal={matchesTotal}
                tab={tab}
                onTabChange={(next) =>
                    updateUrlQueryString([
                        { name: "tab", value: next === "bonds" ? next : "" },
                    ])
                }
                bondPool={bondPool}
                parent={parent}
                onBondRecovered={onBondRecovered}
                commitments={commitments}
                matches={matches}
                tournament={tournament}
            />
        </Stack>
    );
};
