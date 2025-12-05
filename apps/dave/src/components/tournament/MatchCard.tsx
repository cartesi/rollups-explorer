import type { Match } from "@cartesi/viem";
import {
    Card,
    Group,
    Overlay,
    Stack,
    Text,
    useMantineTheme,
    type CardProps,
} from "@mantine/core";
import type { FC } from "react";
import { TbTrophyFilled } from "react-icons/tb";
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

export const MatchCard: FC<MatchCardProps> = ({
    match,
    onClick,
    ...cardProps
}) => {
    const claim1 = { hash: match.commitmentOne };
    const claim2 = { hash: match.commitmentTwo };
    const winner = match.winnerCommitment;
    const theme = useMantineTheme();
    const gold = theme.colors.yellow[5];
    const showWinner = winner !== "NONE";

    return (
        <Card
            component="button"
            withBorder
            shadow="sm"
            radius="lg"
            {...cardProps}
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : undefined }}
        >
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
        </Card>
    );
};
