import {
    Button,
    Card,
    Group,
    Overlay,
    Stack,
    Text,
    Tooltip,
    useMantineTheme,
    type CardProps,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { last } from "ramda";
import type { FC } from "react";
import { TbHelpCircle, TbTrophyFilled } from "react-icons/tb";
import { ClaimText } from "../ClaimText";
import type { Match } from "../types";

type MatchProp = Omit<Match, "tournament">;

export interface MatchCardProps extends CardProps {
    /**
     * The match to display.
     */
    match: MatchProp;

    /**
     * Handler for the match card click event. When not provided, the match card is not clickable.
     */
    onClick?: () => void;
}

const wording = {
    eliminated:
        "This match was eliminated by timeout. None of the claimers act on time.",
};
const EliminatedMatchView: FC<MatchCardProps> = ({ match }) => {
    const { claim1, claim2 } = match;
    const [opened, handlers] = useDisclosure(false);

    return (
        <Group gap={0} wrap="nowrap">
            <Tooltip
                multiline
                label={wording.eliminated}
                opened={opened}
                withArrow
            >
                <Button
                    onClick={(evt) => {
                        evt.stopPropagation();
                        handlers.toggle();
                    }}
                    h="100%"
                    p="5"
                    variant="light"
                >
                    <TbHelpCircle size={24} />
                </Button>
            </Tooltip>
            <Stack gap={0} p="md">
                <Group gap="xs" wrap="nowrap">
                    <ClaimText
                        claim={claim1}
                        style={{
                            textDecoration: "line-through",
                        }}
                        copyButton={false}
                    />
                </Group>
                <Text style={{ textAlign: "center" }}>vs</Text>
                <Group gap="xs" wrap="nowrap">
                    <ClaimText
                        claim={claim2}
                        style={{
                            textDecoration: "line-through",
                        }}
                        copyButton={false}
                    />
                </Group>
            </Stack>
        </Group>
    );
};

const PristineMatchView: FC<MatchCardProps> = ({ match }) => {
    const { claim1, claim2, winner } = match;
    const theme = useMantineTheme();
    const gold = theme.colors.yellow[5];
    const showWinner = !!winner;

    return (
        <Stack p="md">
            <Overlay
                bg={gold}
                opacity={showWinner && winner === 1 ? 0.1 : 0}
                style={{
                    height: claim2 ? "50%" : "100%",
                    pointerEvents: "none",
                }}
            />
            <Overlay
                bg={gold}
                opacity={showWinner && winner === 2 ? 0.1 : 0}
                style={{ top: "50%", height: "50%", pointerEvents: "none" }}
            />
            <Stack gap={0}>
                <Group gap="xs" wrap="nowrap">
                    <TbTrophyFilled
                        size={24}
                        color={gold}
                        opacity={showWinner && winner === 1 ? 1 : 0}
                    />
                    <ClaimText
                        claim={claim1}
                        c={showWinner && winner === 1 ? gold : undefined}
                        fw={showWinner && winner === 1 ? 700 : undefined}
                        style={{
                            textDecoration:
                                winner === 2 && showWinner
                                    ? "line-through"
                                    : undefined,
                        }}
                        copyButton={false}
                    />
                </Group>
                <Text style={{ textAlign: "center" }}>vs</Text>
                <Group gap="xs" wrap="nowrap">
                    <TbTrophyFilled
                        size={24}
                        color={gold}
                        opacity={showWinner && winner === 2 ? 1 : 0}
                    />
                    <ClaimText
                        claim={claim2}
                        c={showWinner && winner === 2 ? gold : undefined}
                        fw={showWinner && winner === 2 ? 700 : undefined}
                        style={{
                            textDecoration:
                                winner === 1 && showWinner
                                    ? "line-through"
                                    : undefined,
                        }}
                        copyButton={false}
                    />
                </Group>
            </Stack>
        </Stack>
    );
};

const getMatchStatus = (match: MatchProp) => {
    const latestAction = last(match.actions) ?? { type: "ok" };

    switch (latestAction.type) {
        case "match_eliminated_by_timeout":
            return "match_eliminated_by_timeout";
        default:
            return "ok";
    }
};

export const MatchCard: FC<MatchCardProps> = ({
    match,
    onClick,
    ...cardProps
}) => {
    const matchStatus = getMatchStatus(match);

    return (
        <Card
            component="button"
            p={0}
            withBorder
            shadow="sm"
            radius="lg"
            {...cardProps}
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : undefined }}
        >
            {matchStatus === "match_eliminated_by_timeout" ? (
                <EliminatedMatchView match={match} />
            ) : (
                <PristineMatchView match={match} />
            )}
        </Card>
    );
};
