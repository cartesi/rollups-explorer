import type { Match } from "@cartesi/viem";
import { Divider, Stack } from "@mantine/core";
import type { FC } from "react";
import { useNavigate, useParams } from "react-router";
import type { Hash } from "viem";
import {
    routePathBuilder,
    type TournamentParams,
} from "../../routes/routePathBuilder";
import { ClaimCard } from "./ClaimCard";
import { MatchCard } from "./MatchCard";
import { MatchLoserCard } from "./MatchLoserCard";

export interface TournamentRoundProps {
    /**
     * The claim that was not matched with another claim yet.
     */
    dangling?: Hash;

    /**
     * Whether to hide the winners.
     */
    hideWinners?: boolean;

    /**
     * The index of the round.
     */
    index: number;

    /**
     * The matches to display.
     */
    matches: Match[];
}

export const TournamentRound: FC<TournamentRoundProps> = (props) => {
    const params = useParams<TournamentParams>();
    const navigate = useNavigate();
    const { dangling, hideWinners, index, matches } = props;
    const onMatchClick = (match: Match) => {
        const url = routePathBuilder.match({
            application: params.application ?? "",
            epochIndex: params.epochIndex ?? "",
            tournamentAddress: params.tournamentAddress ?? "0x",
            matchId: match.idHash,
        });

        if (!url)
            throw new Error(
                `A match needs to be in a tournament or sub-tournament...`,
            );

        navigate(url);
    };

    return (
        <Stack>
            <Divider label={`Round ${index + 1}`} />
            {matches.map((match, index) =>
                hideWinners && match.winnerCommitment !== "NONE" ? (
                    <MatchLoserCard
                        key={`match-loser-card-${index}`}
                        match={match}
                        onClick={() => onMatchClick(match)}
                    />
                ) : hideWinners &&
                  match.winnerCommitment !== "NONE" ? undefined : (
                    <MatchCard
                        key={`match-card-${index}`}
                        match={match}
                        onClick={() => onMatchClick(match)}
                    />
                ),
            )}
            {dangling && <ClaimCard claim={{ hash: dangling }} />}
        </Stack>
    );
};
