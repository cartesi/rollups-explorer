import { Text, Tooltip, type TextProps } from "@mantine/core";
import type { FC } from "react";
import { content } from "../content";
import { formatMetaCycle } from "../lib/metaCycleFormat";

interface MetaCycleProps extends TextProps {
    value: bigint;
}

export const MetaCycle: FC<MetaCycleProps> = ({ value, ...textProps }) => (
    <Tooltip
        label={`${content.tournament.cycle.metaCyclesTxt} ${value}`}
        withArrow
    >
        <Text {...textProps}>{formatMetaCycle(value)}</Text>
    </Tooltip>
);
