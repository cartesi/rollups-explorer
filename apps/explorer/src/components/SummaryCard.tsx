"use client";
import {
    Card,
    Flex,
    Group,
    Skeleton,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { isNotEmpty, isNotNil } from "ramda";
import { isNotNilOrEmpty } from "ramda-adjunct";
import { type FC } from "react";
import { type IconType } from "react-icons";
import { TbChevronRight } from "react-icons/tb";
import TweenedNumber from "./TweenedNumber";

export type SummaryCardProps = {
    icon?: IconType;
    title: string;
    value: number;
    displaySkeleton: boolean;
    href?: string;
};

const SummarySkeletonCard = () => (
    <Card shadow="xs" w="100%">
        <Skeleton animate={false} height={20} circle mb={18} />
        <Skeleton animate={false} height={8} radius="xl" />
        <Skeleton animate={false} height={8} mt={6} radius="xl" />
        <Skeleton animate={false} height={8} mt={6} width="70%" radius="xl" />
    </Card>
);

export const SummaryCard: FC<SummaryCardProps> = (props) => {
    const { hovered, ref } = useHover();
    const router = useRouter();
    const theme = useMantineTheme();
    if (props.displaySkeleton) return <SummarySkeletonCard />;
    const hasHref = isNotNilOrEmpty(props.href);
    return (
        <Card
            key={`${props.title}-summary`}
            shadow="xs"
            ref={ref}
            style={
                hasHref && hovered
                    ? {
                          borderColor: "var(--mantine-color-anchor)",
                          color: "var(--mantine-color-anchor)",
                          cursor: "pointer",
                      }
                    : undefined
            }
            role={hasHref ? "link" : undefined}
            onClick={() => {
                if (isNotNil(props.href) && isNotEmpty(props.href)) {
                    router.push(props.href);
                }
            }}
        >
            <Group justify="space-between">
                <Stack gap={1}>
                    <Flex gap={5} align="center">
                        {props.icon && (
                            <props.icon
                                size={28}
                                data-testid={`summary-card-${props.title?.toLowerCase()}-icon`}
                            />
                        )}
                        <Text
                            c={
                                hasHref && hovered
                                    ? "var(--mantine-color-anchor)"
                                    : "dimmed"
                            }
                            size="lg"
                            inline
                        >
                            {props.title}
                        </Text>
                    </Flex>
                    <Text fw="bold" fz="2rem">
                        <TweenedNumber value={props.value} />
                    </Text>
                </Stack>

                {hasHref && <TbChevronRight size={theme.other.mdIconSize} />}
            </Group>
        </Card>
    );
};
