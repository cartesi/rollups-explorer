"use client";
import { Card, Flex, Text } from "@mantine/core";
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
