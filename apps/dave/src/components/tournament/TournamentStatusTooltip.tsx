import { ActionIcon, Tooltip } from "@mantine/core";
import type { FC } from "react";
import { TbQuestionMark } from "react-icons/tb";
import type { TournamentStatus } from "../types";

type Props = { status: TournamentStatus };

const wording = {
    OPEN: "The tournament is open to receive claims.",
    CLOSED: "The tournament is still ongoing but is closed to receive new claims.",
    FINALIZED:
        "The tournament has finished. If no disputes happen, then there is no winner.",
} as const;

export const TournamentStatusTooltip: FC<Props> = ({ status }) => {
    return (
        <Tooltip
            label={wording[status]}
            events={{ touch: true, focus: false, hover: true }}
            multiline
            withArrow
        >
            <ActionIcon variant="outline" radius="xl" size="xs" color="gray">
                <TbQuestionMark size={14} />
            </ActionIcon>
        </Tooltip>
    );
};
