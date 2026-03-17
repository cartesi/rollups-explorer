import type { Match } from "@cartesi/viem";
import { Divider, Stack } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import type { FC } from "react";
import type { Hash } from "viem";
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
    const pathname = usePathname();
    const router = useRouter();

    const { dangling, hideWinners, index, matches } = props;
    const onMatchClick = (match: Match) => {
        const url = `${pathname}/matches/${match.idHash}`;
        router.push(url);
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
