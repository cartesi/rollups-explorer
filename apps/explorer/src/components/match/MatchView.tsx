import type {
    Commitment,
    Match,
    MatchAdvanced,
    Tournament,
} from "@cartesi/client";
import { Stack, Text, Title } from "@mantine/core";
import { type FC } from "react";
import type { Hash, Hex } from "viem";
import { content } from "../../content";
import type { JoinBond, PartialBondRefundEvent } from "../../lib/bondUtils";
import { getTournamentCycleRange } from "../../lib/prtUtils";
import { JoinBonds } from "../bond/JoinBonds";
import { ClaimText } from "../ClaimText";
import { CycleRangeFormatted } from "../CycleRangeFormatted";
import { DetailRow } from "../DetailRow";
import { MatchActions } from "./MatchActions";
import { MatchState } from "./MatchState";

export interface MatchViewProps {
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
     * The parent Tournament
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

export const MatchView: FC<MatchViewProps> = (props) => {
    const {
        advances,
        commitments = [],
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
    const claim1 = { hash: match.commitmentOne };
    const claim2 = { hash: match.commitmentTwo };
    const depositors = commitments.map((commitment) => ({
        commitment: commitment.commitment,
        depositor: commitment.submitterAddress,
    }));

    return (
        <Stack gap="xl">
            <Stack gap="xs">
                <DetailRow
                    label={content.tournament.cycleRangeTxt}
                    hint={content.tournament.cycle.rangeHint}
                >
                    <CycleRangeFormatted
                        range={getTournamentCycleRange(tournament)}
                    />
                </DetailRow>
                <DetailRow label={content.match.claimsTxt}>
                    <ClaimText claim={claim1} />
                    <Text>vs</Text>
                    <ClaimText claim={claim2} />
                </DetailRow>
                {commitments.length > 0 && (
                    <DetailRow
                        label={content.bond.join.bondsTxt}
                        hint={content.bond.join.bondsHint}
                    >
                        <JoinBonds
                            bonds={joinBonds}
                            commitments={commitments}
                            loading={joinBondsLoading}
                        />
                    </DetailRow>
                )}
                <MatchState
                    commitments={commitments}
                    match={match}
                    tournament={tournament}
                />
            </Stack>
            <Stack gap="sm">
                <Title order={3} c="dimmed">
                    {content.match.actionsTxt}
                </Title>
                <MatchActions
                    advances={advances}
                    depositors={depositors}
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
        </Stack>
    );
};
