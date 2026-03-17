"use client";
import { Card, Flex, Skeleton, Text } from "@mantine/core";
import { type FC } from "react";
import { type IconType } from "react-icons";
import TweenedNumber from "./TweenedNumber";

export type SummaryCardProps = {
    icon?: IconType;
    title: string;
    value: number;
    displaySkeleton: boolean;
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
    if (props.displaySkeleton) return <SummarySkeletonCard />;

    return (
        <Card key={`${props.title}-summary`} shadow="xs">
            <Flex gap={5} align="center">
                {props.icon && (
                    <props.icon
                        size={28}
                        data-testid={`summary-card-${props.title?.toLowerCase()}-icon`}
                    />
                )}
                <Text c="dimmed" size="lg" inline>
                    {props.title}
                </Text>
            </Flex>
            <Text fw="bold" fz="2rem">
                <TweenedNumber value={props.value} />
            </Text>
        </Card>
    );
};
