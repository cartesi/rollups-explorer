import type { FC, ReactNode } from "react";
import {
    Card as MantineCard,
    CardProps as MantineCardProps,
    useMantineColorScheme,
} from "@mantine/core";

export interface CardProps extends MantineCardProps {
    children: ReactNode;
}

export const Card: FC<CardProps> = ({ children, ...restProps }) => {
    const { colorScheme } = useMantineColorScheme();

    return (
        <MantineCard
            {...restProps}
            shadow="sm"
            style={{
                ...restProps.style,
                border: `calc(0.0625rem * var(--mantine-scale)) solid ${
                    colorScheme === "light"
                        ? "var(--mantine-color-gray-3)"
                        : "var(--mantine-color-dark-4)"
                }`,
            }}
        >
            {children}
        </MantineCard>
    );
};
