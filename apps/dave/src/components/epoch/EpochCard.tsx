import type { Epoch } from "@cartesi/viem";
import { Badge, Card, Group, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import type { FC } from "react";
import { useEpochStatusColor } from "./useEpochStatusColor";

type Props = { epoch: Epoch };

export const EpochCard: FC<Props> = ({ epoch }) => {
    const theme = useMantineTheme();
    const epochIndex = epoch.index?.toString() ?? "0";
    const url = `epochs/${epochIndex}`;
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
    const color = useEpochStatusColor(epoch);
    const inDispute = false; // XXX: how to know if an epoch is in dispute?

    return (
        <Card shadow="md" withBorder component={Link} href={url}>
            <Group justify="space-between" gap={isMobile ? "xs" : "xl"}>
                <Text size="xl"># {epoch.index}</Text>
                {inDispute && (
                    <Badge variant="outline" color={color}>
                        disputed
                    </Badge>
                )}
                <Badge size="md" color={color}>
                    {epoch.status}
                </Badge>
            </Group>
        </Card>
    );
};
