import type {
    Match,
    Tournament,
    TournamentStandingState,
} from "@cartesi/client";
import {
    Badge,
    Divider,
    Flex,
    Group,
    Stack,
    Text,
    useMantineTheme,
    type MantineColor,
} from "@mantine/core";
import type { FC } from "react";
import { TbTrophyFilled } from "react-icons/tb";
import { content } from "../../content";
import { getDefendedSide, getTournamentOutcome } from "../../lib/prtUtils";
import { ClaimText } from "../ClaimText";
import { DetailRow } from "../DetailRow";
import { LongText } from "../LongText";

const standingColors: Record<TournamentStandingState, MantineColor> = {
    MATCHES_ACTIVE: "blue",
    AWAITING_CLOSURE: "yellow",
    ROOT_WINNER: "green",
    ROOT_FAILED: "gray",
    INNER_WINNER: "teal",
    INNER_ELIMINABLE_NO_WINNER: "gray",
    INNER_ELIMINABLE_WINNER_EXPIRED: "orange",
};

const standingHints: Partial<Record<TournamentStandingState, string>> =
    content.tournament.standingHint;

const sides = ["ONE", "TWO"] as const;

export interface TournamentOutcomeProps {
    /**
     * The parent match an inner tournament settles, whose commitments claim
     * the contested final states.
     */
    parentMatch?: Pick<Match, "commitmentOne" | "commitmentTwo"> | null;

    /**
     * The tournament, for its standing, result and contested final states.
     */
    tournament: Pick<
        Tournament,
        "snapshot" | "contestedFinalStateOne" | "contestedFinalStateTwo"
    >;
}

export const TournamentOutcome: FC<TournamentOutcomeProps> = ({
    parentMatch,
    tournament,
}) => {
    const { snapshot } = tournament;
    const theme = useMantineTheme();
    const gold = theme.colors.yellow[5];
    const outcome = getTournamentOutcome(snapshot);
    const hint = standingHints[snapshot.standing];
    const contested =
        tournament.contestedFinalStateOne && tournament.contestedFinalStateTwo
            ? {
                  ONE: tournament.contestedFinalStateOne,
                  TWO: tournament.contestedFinalStateTwo,
              }
            : null;
    const defended = getDefendedSide(tournament, snapshot.finalStateHash);

    return (
        <Stack gap="xs">
            <DetailRow label={content.tournament.standingTxt} hint={hint}>
                <Badge color={standingColors[snapshot.standing]}>
                    {content.tournament.standing[snapshot.standing]}
                </Badge>
                <Text size="xs" c="dimmed">
                    {`${content.tournament.asOfBlockTxt} ${snapshot.asOfBlock}`}
                </Text>
            </DetailRow>
            <DetailRow label={content.tournament.winnerTxt}>
                {outcome.status === "winner" && (
                    <Group gap="xs">
                        <TbTrophyFilled size={24} color={gold} />
                        <LongText value={outcome.commitment} ff="monospace" />
                    </Group>
                )}
                {outcome.status === "provisional" && (
                    <Group gap="xs">
                        <TbTrophyFilled size={24} color={gold} />
                        <LongText value={outcome.commitment} ff="monospace" />
                        <Text size="xs" c="dimmed">
                            {`${content.tournament.expiresAtBlockTxt} ${outcome.expiresAt}`}
                        </Text>
                    </Group>
                )}
                {outcome.status === "expired" && (
                    <Group gap="xs">
                        <TbTrophyFilled size={24} color="lightgray" />
                        {outcome.candidate && (
                            <LongText
                                value={outcome.candidate}
                                ff="monospace"
                                td="line-through"
                            />
                        )}
                    </Group>
                )}
                {outcome.status === "noWinner" && (
                    <Group gap="xs">
                        <TbTrophyFilled size={24} color="lightgray" />
                        <Text c="dimmed">{content.tournament.noWinnerTxt}</Text>
                    </Group>
                )}
                {outcome.status === "pending" && (
                    <Group gap="xs">
                        <TbTrophyFilled size={24} color="lightgray" />
                        {outcome.candidate && (
                            <>
                                <Text size="sm" c="dimmed">
                                    {content.tournament.candidateTxt}
                                </Text>
                                <LongText
                                    value={outcome.candidate}
                                    ff="monospace"
                                />
                            </>
                        )}
                    </Group>
                )}
            </DetailRow>
            {snapshot.finalStateHash && (
                <DetailRow label={content.tournament.finalStateTxt}>
                    <LongText value={snapshot.finalStateHash} ff="monospace" />
                </DetailRow>
            )}
            {contested && (
                <DetailRow
                    label={content.tournament.contestedTxt}
                    hint={content.tournament.contestedHint}
                >
                    <Stack gap="sm">
                        {sides.map((side) => {
                            const commitment =
                                parentMatch?.[
                                    side === "ONE"
                                        ? "commitmentOne"
                                        : "commitmentTwo"
                                ];
                            return (
                                <Group
                                    key={side}
                                    gap="sm"
                                    wrap="nowrap"
                                    align="stretch"
                                >
                                    <Divider
                                        orientation="vertical"
                                        size="md"
                                        color={
                                            defended === side
                                                ? "green.4"
                                                : "gray.3"
                                        }
                                    />
                                    <Flex
                                        wrap="wrap"
                                        align="center"
                                        columnGap="xs"
                                        rowGap={{ base: 4, sm: "xs" }}
                                    >
                                        {commitment && (
                                            <ClaimText
                                                claim={{ hash: commitment }}
                                                iconSize={
                                                    theme.other.smIconSize
                                                }
                                                copyButton={false}
                                            />
                                        )}
                                        <Group gap="xs" wrap="nowrap">
                                            {commitment && (
                                                <Text size="sm" c="dimmed">
                                                    {
                                                        content.tournament
                                                            .contestedClaimsTxt
                                                    }
                                                </Text>
                                            )}
                                            <LongText
                                                value={contested[side]}
                                                ff="monospace"
                                            />
                                        </Group>
                                        {defended === side && (
                                            <Badge
                                                color="green"
                                                variant="light"
                                            >
                                                {content.tournament.defendedTxt}
                                            </Badge>
                                        )}
                                    </Flex>
                                </Group>
                            );
                        })}
                    </Stack>
                </DetailRow>
            )}
        </Stack>
    );
};
