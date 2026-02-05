import type { Epoch } from "@cartesi/viem";
import { Badge, Card, Group, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { FC } from "react";
import { pathBuilder } from "../../routes/routePathBuilder";
import { useEpochStatusColor } from "./useEpochStatusColor";

type Props = { epoch: Epoch };

export const EpochCard: FC<Props> = ({ epoch }) => {
    const theme = useMantineTheme();
    const params = useParams<{ application: string }>();
    const url = pathBuilder.epoch({
        application: params.application,
        epochIndex: epoch.index,
    });
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
