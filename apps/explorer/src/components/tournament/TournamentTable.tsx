import type { Commitment, Match } from "@cartesi/viem";
import { Flex } from "@mantine/core";
import { useMemo, type FC } from "react";
import type { Hash } from "viem";
import { TournamentRound } from "./TournamentRound";
import style from "./TournamentTable.module.css";

export interface TournamentTableProps {
    hideWinners?: boolean;

    /**
     * Simulated current time.
     * When not provided, all matches are shown.
     * When provided, the match timestamps are used to filter out events that did not happen yet based on the simulated time.
     */
    now?: number;

    /**
     * The matches to display.
     */
    matches: Match[];

    /**
     * The list of all commitments.
     */
    commitments: Commitment[];
}

function lazyArray<T>(factory: () => T): T[] {
    return new Proxy([] as T[], {
        get(target, prop, receiver) {
            if (typeof prop === "string") {
                const index = Number(prop);
                if (!Number.isNaN(index)) {
                    if (!(prop in target)) {
                        // Lazily create the element
                        target[index] = factory();
                    }
                }
            }
            return Reflect.get(target, prop, receiver);
        },
    });
}

/**
 * Distribute matches into rounds
 * @param matches Matches to distribute
 * @returns Rounds of matches
 */
type Round = {
    matches: Match[];
    dangling?: Hash;
};
const roundify = (
    matches: Match[],
    danglingClaim?: Commitment,
    now?: number,
): Round[] => {
    const sets = lazyArray(() => new Set<Hash>());
    const rounds: Round[] = lazyArray(() => ({
        matches: [],
        now,
    }));
    const dangling: Set<Hash> = new Set(
        danglingClaim ? [danglingClaim.commitment] : [],
    );
    for (const match of matches) {
        for (let i = 0; i < matches.length; i++) {
            if (
                !sets[i].has(match.commitmentOne) &&
                !sets[i].has(match.commitmentTwo)
            ) {
                sets[i].add(match.commitmentOne);
                sets[i].add(match.commitmentTwo);
                rounds[i].matches.push(match);

                if (match.winnerCommitment !== "NONE") {
                    // add winner to dangling set
                    dangling.add(
                        match.winnerCommitment === "ONE"
                            ? match.commitmentOne
                            : match.commitmentTwo,
                    );
                } else {
                    // remove both from dangling set
                    dangling.delete(match.commitmentOne);
                    dangling.delete(match.commitmentTwo);
                }
                break;
            }
        }
    }
    if (rounds.length === 0 && dangling.size > 0) {
        // add a round for the dangling claim
        rounds.push({
            matches: [],
            dangling: dangling.values().next().value,
        });
    } else {
        // put dangling claim into last round
        rounds[rounds.length - 1].dangling = dangling.values().next().value;
    }
    return rounds;
};

export const TournamentTable: FC<TournamentTableProps> = (props) => {
    const { commitments, hideWinners, now } = props;

    const rounds = useMemo(() => {
        // create a unique set of commitments in matches
        const commitmentsInMatches = new Set(
            props.matches.flatMap((match) => [
                match.commitmentOne,
                match.commitmentTwo,
            ]),
        );

        // among all commitments, find the one that is not part of any matches
        // that one is the dangling claim
        // XXX: there should be only one. do what if there are more?
        const danglingClaim = commitments.filter(
            ({ commitment }) => !commitmentsInMatches.has(commitment),
        );

        // sort matches by timestamp
        // XXX: maybe we should assume that the matches are already sorted by timestamp?
        const matches = [...props.matches].sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );
        return roundify(matches, danglingClaim[0], now);
    }, [props.matches, commitments, now]);

    return (
        <Flex gap="md" className={style.container} px="xs" py="sm">
            {rounds.map((round, index) => (
                <TournamentRound
                    key={`round-${index}`}
                    index={index}
                    matches={round.matches}
                    hideWinners={hideWinners}
                    dangling={round.dangling}
                />
            ))}
        </Flex>
    );
};
