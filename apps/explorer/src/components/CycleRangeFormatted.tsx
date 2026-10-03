import { Text, Tooltip, type TextProps } from "@mantine/core";
import type { FC } from "react";
import { content } from "../content";
import { formatMetaCycleRange } from "../lib/metaCycleFormat";
import type { CycleRange } from "./types";

interface CycleRangeFormattedProps extends TextProps {
    /**
     * Half-open meta-cycle range, shown with an inclusive end.
     */
    range: CycleRange;
}

export const CycleRangeFormatted: FC<CycleRangeFormattedProps> = ({
    range,
    ...textProps
}) => {
    const [start, end] = range;
    const last = end > start ? end - 1n : start;
    return (
        <Tooltip
            label={`${content.tournament.cycle.metaCyclesTxt} ${start} – ${last}`}
            multiline
            withArrow
        >
            <Text {...textProps}>{formatMetaCycleRange(range)}</Text>
        </Tooltip>
    );
};
