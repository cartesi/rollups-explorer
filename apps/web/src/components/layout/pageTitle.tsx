import { Group, Title } from "@mantine/core";
import { FC, JSX } from "react";

interface PageTitleProps {
    title: string;
    Icon: JSX.ElementType;
}

const PageTitle: FC<PageTitleProps> = ({ title, Icon }) => {
    return (
        <Group mb="sm" data-testid="page-title">
            <Icon size={40} />
            <Title order={2}>{title}</Title>
        </Group>
    );
};

export default PageTitle;
