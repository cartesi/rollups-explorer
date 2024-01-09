import { FC } from "react";
import { Anchor, Flex, Text } from "@mantine/core";
import Link from "next/link";

const PageNotFound: FC = () => {
    return (
        <Flex
            w="100%"
            h="100%"
            justify="center"
            align="center"
            style={{ minHeight: "inherit" }}
        >
            <Flex direction="column" justify="center" align="center">
                <Text size="xl" fw={600} mb={2}>
                    404 Not Found
                </Text>
                <Text size="md" fw={500} mb={8}>
                    Could not find the requested resource.
                </Text>
                <Anchor href="/" component={Link}>
                    Go back
                </Anchor>
            </Flex>
        </Flex>
    );
};

export default PageNotFound;
