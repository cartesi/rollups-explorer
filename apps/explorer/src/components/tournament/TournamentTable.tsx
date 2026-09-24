import type { Match } from "@cartesi/client";
import { Flex } from "@mantine/core";
import { useMemo, type FC } from "react";
import type { Hash } from "viem";
import { TournamentRound } from "./TournamentRound";
import style from "./TournamentTable.module.css";

export interface TournamentTableProps {
    /**
     * The commitment waiting for an opponent.
     */
    candidate?: Hash | null;

    hideWinners?: boolean;

    /**
     * The matches to display.
     */
    matches: Match[];
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
const roundify = (matches: Match[], candidate?: Hash | null): Round[] => {
    const sets = lazyArray(() => new Set<Hash>());
    const rounds: Round[] = lazyArray(() => ({ matches: [] }));
    for (const match of matches) {
        for (let i = 0; i < matches.length; i++) {
            if (
                !sets[i].has(match.commitmentOne) &&
                !sets[i].has(match.commitmentTwo)
            ) {
                sets[i].add(match.commitmentOne);
                sets[i].add(match.commitmentTwo);
                rounds[i].matches.push(match);
                break;
            }
        }
    }
    if (!candidate) return rounds;
    if (rounds.length === 0) {
        return [{ matches: [], dangling: candidate }];
    }
    rounds[rounds.length - 1].dangling = candidate;
    return rounds;
};

export const TournamentTable: FC<TournamentTableProps> = (props) => {
    const { candidate, hideWinners } = props;

    const rounds = useMemo(() => {
        const matches = [...props.matches].sort((a, b) =>
            a.blockNumber === b.blockNumber
                ? Number(a.logIndex - b.logIndex)
                : Number(a.blockNumber - b.blockNumber),
        );
        return roundify(matches, candidate);
    }, [props.matches, candidate]);

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
