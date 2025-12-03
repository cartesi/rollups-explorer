import type { Match, MatchAdvanced, Tournament } from "@cartesi/viem";
import { Stack } from "@mantine/core";
import type { FC } from "react";
import { TbSwords } from "react-icons/tb";
import PageTitle from "../components/layout/PageTitle";
import { MatchView } from "../components/match/MatchView";
import type { CycleRange } from "../components/types";

export interface MatchPageProps {
    /**
     * List of advances (bisections) of the match
     */
    advances: MatchAdvanced[];

    /**
     * The tournament to display.
     */
    tournament: Tournament;

    /**
     * The match to display.
     */
    match: Match;

    /**
     * The current timestamp.
     */
    now: number;
}

export const MatchPage: FC<MatchPageProps> = (props) => {
    const { advances, tournament, match, now } = props;
    // XXX: where the range is coming from?
    // const range = [tournament.startCycle, tournament.endCycle] as CycleRange;
    const range = [0, 0] as CycleRange;

    return (
        <Stack>
            <PageTitle Icon={TbSwords} title="Match" />
            <MatchView
                advances={advances}
                tournament={tournament}
                range={range}
                match={match}
                now={now}
            />
        </Stack>
    );
};
