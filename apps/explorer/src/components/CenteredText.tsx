import {
    Card,
    Center,
    Text,
    type CardProps,
    type TextProps,
} from "@mantine/core";
import type { FC } from "react";

interface CenteredTextProps {
    text: string;
    cardProps?: CardProps;
    textProps?: TextProps;
}

const CenteredText: FC<CenteredTextProps> = (props) => {
    return (
        <Card shadow="md" {...props.cardProps}>
            <Center>
                <Text c="dimmed" size="xl" tt="uppercase" {...props.textProps}>
                    {props.text}
                </Text>
            </Center>
        </Card>
    );
};

export default CenteredText;
