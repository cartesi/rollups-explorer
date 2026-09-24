import { Flex, Tooltip } from "@mantine/core";
import type { FC } from "react";
import { TbInfoCircle } from "react-icons/tb";

export interface InfoHintProps {
    /**
     * The explanation shown in the tooltip.
     */
    label: string;

    /**
     * The size of the icon.
     */
    size?: number;
}

export const InfoHint: FC<InfoHintProps> = ({ label, size = 16 }) => (
    <Tooltip
        label={label}
        multiline
        withArrow
        w={300}
        events={{ hover: true, focus: true, touch: true }}
    >
        <Flex c="dimmed" tabIndex={0} aria-label={label}>
            <TbInfoCircle size={size} />
        </Flex>
    </Tooltip>
);
