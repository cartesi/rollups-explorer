import { Flex, Group, Text } from "@mantine/core";
import type { FC, ReactNode } from "react";
import { InfoHint } from "./InfoHint";

export interface DetailRowProps {
    /**
     * Label shown in the aligned label column.
     */
    label: string;

    /**
     * Optional explanation shown next to the label.
     */
    hint?: string;

    children: ReactNode;
}

/**
 * A label and value pair whose labels line up in one column, stacking the
 * value under the label on small screens.
 */
export const DetailRow: FC<DetailRowProps> = ({ label, hint, children }) => (
    <Flex
        direction={{ base: "column", sm: "row" }}
        gap={{ base: 2, sm: "md" }}
        align={{ base: "flex-start", sm: "center" }}
    >
        <Group gap={4} wrap="nowrap" w={{ sm: 160 }} style={{ flexShrink: 0 }}>
            <Text c="dimmed">{label}</Text>
            {hint && <InfoHint label={hint} />}
        </Group>
        <Group gap="xs" style={{ minWidth: 0 }}>
            {children}
        </Group>
    </Flex>
);
