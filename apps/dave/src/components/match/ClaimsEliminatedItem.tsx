import {
    Group,
    Paper,
    Text,
    useComputedColorScheme,
    useMantineTheme,
} from "@mantine/core";
import type { FC } from "react";
import { TbSwordOff } from "react-icons/tb";
import { ClaimTimelineItem } from "./ClaimTimelineItem";

type ClaimsEliminatedItemProps = {
    /**
     * Current timestamp
     */
    now: number;

    /**
     * Timestamp
     */
    timestamp: number;
};

export const ClaimsEliminatedItem: FC<ClaimsEliminatedItemProps> = ({
    now,
    timestamp,
}) => {
    const theme = useMantineTheme();
    const scheme = useComputedColorScheme();
    const bg = scheme === "light" ? theme.colors.gray[0] : undefined;

    return (
        <ClaimTimelineItem now={now} timestamp={timestamp}>
            <Paper withBorder p={16} radius="lg" bg={bg}>
                <Group gap="xs">
                    <TbSwordOff size={24} />
                    <Text>both claims eliminated</Text>
                </Group>
            </Paper>
        </ClaimTimelineItem>
    );
};
