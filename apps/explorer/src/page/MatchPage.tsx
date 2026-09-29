import type {
    Commitment,
    Match,
    MatchAdvanced,
    Tournament,
} from "@cartesi/client";
import { Stack } from "@mantine/core";
import type { FC } from "react";
import { TbSwords } from "react-icons/tb";
import type { Hash, Hex } from "viem";
import PageTitle from "../components/layout/PageTitle";
import { MatchView } from "../components/match/MatchView";
import type { JoinBond, PartialBondRefundEvent } from "../lib/bondUtils";

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
     * Bonds the two commitments posted on join, by commitment.
     */
    joinBonds?: Map<Hash, JoinBond>;

    /**
     * Whether the join bonds are still being fetched.
     */
    joinBondsLoading?: boolean;

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
     * Proof of a leaf step win, `null` when it cannot be read.
     */
    stepProof?: Hex | null;

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
        joinBonds,
        joinBondsLoading,
        tournament,
        match,
        refunds,
        stepProof,
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
                joinBonds={joinBonds}
                joinBondsLoading={joinBondsLoading}
                match={match}
                now={now}
                refunds={refunds}
                subTournament={subTournament}
                stepProof={stepProof}
                timestamps={timestamps}
                timestampsLoading={timestampsLoading}
                tournament={tournament}
            />
        </Stack>
    );
};
