import type {
    Commitment,
    Match,
    MatchAdvanced,
    Tournament,
} from "@cartesi/client";
import { Stack } from "@mantine/core";
import type { FC } from "react";
import { TbSwords } from "react-icons/tb";
import type { Hash } from "viem";
import PageTitle from "../components/layout/PageTitle";
import { MatchView } from "../components/match/MatchView";
import type { PartialBondRefundEvent } from "../lib/bondUtils";

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
     * Partial bond refunds of the tournament, by transaction hash.
     */
    refunds?: Map<Hash, PartialBondRefundEvent>;

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

    /**
     * Timestamps in milliseconds of the blocks the match events happened in.
     */
    timestamps?: Map<bigint, number>;

    /**
     * Whether the block timestamps are still being fetched.
     */
    timestampsLoading?: boolean;
}

export const MatchPage: FC<MatchPageProps> = (props) => {
    const {
        advances,
        commitments,
        tournament,
        match,
        refunds,
        subTournament,
        now,
        timestamps,
        timestampsLoading,
    } = props;

    return (
        <Stack>
            <PageTitle Icon={TbSwords} title="Match" />
            <MatchView
                advances={advances}
                commitments={commitments}
                match={match}
                now={now}
                refunds={refunds}
                subTournament={subTournament}
                timestamps={timestamps}
                timestampsLoading={timestampsLoading}
                tournament={tournament}
            />
        </Stack>
    );
};
