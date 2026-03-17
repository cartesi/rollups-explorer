import type { Match } from "@cartesi/viem";
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
import type { FC } from "react";
import { TbInfoCircle, TbTrophyFilled } from "react-icons/tb";
import { ClaimText } from "../ClaimText";

export interface MatchCardProps extends CardProps {
    /**
     * The match to display.
     */
    match: Match;

    /**
     * Handler for the match card click event. When not provided, the match card is not clickable.
     */
    onClick?: () => void;
}

type EliminationReasons = Extract<
    Match["deletionReason"],
    "TIMEOUT" | "CHILD_TOURNAMENT"
>;

const eliminationWording: Record<EliminationReasons, string> = {
    TIMEOUT:
        "Match was eliminated due to both commitments failure to act on time.",
    CHILD_TOURNAMENT:
        "Match was eliminated due to a subsequent match result. Click the match for more details.",
};

const MatchEliminated: FC<MatchCardProps> = ({ match }) => {
    const [opened, handlers] = useDisclosure(false);
    const claim1 = { hash: match.commitmentOne };
    const claim2 = { hash: match.commitmentTwo };
    const reason = match.deletionReason as EliminationReasons;

    return (
        <>
            <Group gap={0} align="stretch" pe="md">
                <Tooltip
                    label={
                        <Text fw="bold" size="sm">
                            {eliminationWording[reason]}
                        </Text>
                    }
                    opened={opened}
                    multiline
                    withArrow
                    arrowSize={8}
                >
                    <Button
                        component="div"
                        px="5"
                        h="auto"
                        variant="light"
                        onClick={(evt) => {
                            evt.stopPropagation();
                            handlers.toggle();
                        }}
                    >
                        <TbInfoCircle size={24} />
                    </Button>
                </Tooltip>
                <Stack gap={0} py="md" pl="sm">
                    <Group gap="xs" wrap="nowrap">
                        <ClaimText
                            claim={claim1}
                            td="line-through"
                            copyButton={false}
                        />
                    </Group>
                    <Text style={{ textAlign: "center" }}>vs</Text>
                    <Group gap="xs" wrap="nowrap">
                        <ClaimText
                            claim={claim2}
                            td="line-through"
                            copyButton={false}
                        />
                    </Group>
                </Stack>
            </Group>
        </>
    );
};

const Match: FC<MatchCardProps> = ({ match }) => {
    const claim1 = { hash: match.commitmentOne };
    const claim2 = { hash: match.commitmentTwo };
    const winner = match.winnerCommitment;
    const theme = useMantineTheme();
    const gold = theme.colors.yellow[5];
    const showWinner = winner !== "NONE";

    return (
        <>
            <Overlay
                bg={gold}
                opacity={showWinner && winner === "ONE" ? 0.1 : 0}
                style={{
                    height: claim2 ? "50%" : "100%",
                    pointerEvents: "none",
                }}
            />
            <Overlay
                bg={gold}
                opacity={showWinner && winner === "TWO" ? 0.1 : 0}
                style={{ top: "50%", height: "50%", pointerEvents: "none" }}
            />
            <Stack gap={0}>
                <Group gap="xs" wrap="nowrap">
                    <TbTrophyFilled
                        size={24}
                        color={gold}
                        opacity={showWinner && winner === "ONE" ? 1 : 0}
                    />
                    <ClaimText
                        claim={claim1}
                        c={showWinner && winner === "ONE" ? gold : undefined}
                        fw={showWinner && winner === "ONE" ? 700 : undefined}
                        style={{
                            textDecoration:
                                winner === "TWO" && showWinner
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
                        opacity={showWinner && winner === "TWO" ? 1 : 0}
                    />
                    <ClaimText
                        claim={claim2}
                        c={showWinner && winner === "TWO" ? gold : undefined}
                        fw={showWinner && winner === "TWO" ? 700 : undefined}
                        style={{
                            textDecoration:
                                winner === "ONE" && showWinner
                                    ? "line-through"
                                    : undefined,
                        }}
                        copyButton={false}
                    />
                </Group>
            </Stack>
        </>
    );
};

export const MatchCard: FC<MatchCardProps> = ({
    match,
    onClick,
    ...cardProps
}) => {
    const isMatchEliminated =
        match.deletionReason !== "NOT_DELETED" &&
        match.winnerCommitment === "NONE";
    const cardPadding = isMatchEliminated ? "0" : "";

    return (
        <Card
            component="button"
            withBorder
            shadow="sm"
            radius="lg"
            {...cardProps}
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : undefined }}
            p={cardPadding}
        >
            {isMatchEliminated ? (
                <MatchEliminated
                    match={match}
                    onClick={onClick}
                    {...cardProps}
                />
            ) : (
                <Match match={match} />
            )}
        </Card>
    );
};
