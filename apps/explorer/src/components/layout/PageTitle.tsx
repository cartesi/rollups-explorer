import { Group, Title, useMantineTheme } from "@mantine/core";
import type { FC, JSX } from "react";

interface PageTitleProps {
    title: string;
    Icon: JSX.ElementType;
}

const PageTitle: FC<PageTitleProps> = ({ title, Icon }) => {
    const theme = useMantineTheme();
    return (
        <Group gap="xs">
            <Icon size={theme.other.lgIconSize} />
            <Title order={1}>{title}</Title>
        </Group>
    );
};

export default PageTitle;
