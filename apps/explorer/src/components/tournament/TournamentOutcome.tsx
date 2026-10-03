import type {
    TournamentSnapshot,
    TournamentStandingState,
} from "@cartesi/client";
import {
    Badge,
    Group,
    Stack,
    Text,
    useMantineTheme,
    type MantineColor,
} from "@mantine/core";
import type { FC } from "react";
import { TbTrophyFilled } from "react-icons/tb";
import { content } from "../../content";
import { getTournamentOutcome } from "../../lib/prtUtils";
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

export interface TournamentOutcomeProps {
    snapshot: TournamentSnapshot;
}

export const TournamentOutcome: FC<TournamentOutcomeProps> = ({ snapshot }) => {
    const theme = useMantineTheme();
    const gold = theme.colors.yellow[5];
    const outcome = getTournamentOutcome(snapshot);
    const hint = standingHints[snapshot.standing];

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
        </Stack>
    );
};
