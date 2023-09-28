"use client";
import { Card, Group, Text } from "@mantine/core";
import { FC } from "react";
import { IconType } from "react-icons";
import TweenedNumber from "./TweenedNumber";

export type SummaryCardProps = {
    icon?: IconType;
    title: string;
    value: number;
};

export const SummaryCard: FC<SummaryCardProps> = (props) => {
    return (
        <Card shadow="xs">
            <Group gap={5}>
                {props.icon && (
                    <props.icon
                        size={20}
                        data-testid={`summary-card-${props.title?.toLowerCase()}-icon`}
                    />
                )}
                <Text c="dimmed">{props.title}</Text>
            </Group>
            <Text fw="bold" fz="2rem">
                <TweenedNumber value={props.value} />
            </Text>
        </Card>
    );
};
