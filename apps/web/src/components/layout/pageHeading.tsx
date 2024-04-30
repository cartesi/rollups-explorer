import { Group, Title } from "@mantine/core";
import { FC, JSX } from "react";

interface PageHeadingProps {
    heading: string;
    Icon: JSX.ElementType;
}

const PageHeading: FC<PageHeadingProps> = ({ heading, Icon }) => {
    return (
        <Group mb="sm">
            <Icon size={40} />
            <Title data-testid="page-heading" order={2}>
                {heading}
            </Title>
        </Group>
    );
};

export default PageHeading;
