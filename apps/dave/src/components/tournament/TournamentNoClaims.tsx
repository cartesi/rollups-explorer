import { Center, Title } from "@mantine/core";
import type { FC } from "react";
import type { TournamentStatus } from "../types";

type Props = { status: TournamentStatus };

const wording = {
    OPEN: "There are no claims for this tournament until now.",
    CLOSED: "There were no claims and the tournament is not accepting new claims.",
    FINALIZED: "There were no claims and the tournament is finalized.",
} as const;

export const TournamentNoClaims: FC<Props> = ({ status }) => {
    const text = wording[status];
    return (
        <Center mt="lg">
            <Title order={3} c="dimmed">
                {text}
            </Title>
        </Center>
    );
};
