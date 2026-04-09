import { Stack, Title, type StackProps, type TitleProps } from "@mantine/core";
import { isNotNilOrEmpty } from "ramda-adjunct";
import type { FC, ReactNode } from "react";

interface DisplayContainerErrorProps {
    title: ReactNode;
    subtitle?: ReactNode;
    stackProps?: StackProps;
    titleProps?: TitleProps;
    subtitleProps?: TitleProps;
    children?: ReactNode;
}

const DisplayContainerError: FC<DisplayContainerErrorProps> = ({
    title,
    subtitle,
    stackProps,
    titleProps,
    subtitleProps,
    children,
}) => {
    return (
        <Stack align="center" justify="center" pt="xl" {...stackProps}>
            <Title order={2} {...titleProps}>
                {title}
            </Title>
            {isNotNilOrEmpty(subtitle) && (
                <Title order={4} c="dimmed" {...subtitleProps}>
                    {subtitle}
                </Title>
            )}
            {isNotNilOrEmpty(children) && children}
        </Stack>
    );
};

export default DisplayContainerError;
