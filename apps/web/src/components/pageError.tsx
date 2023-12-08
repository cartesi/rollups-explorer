"use client";

import { FC } from "react";
import { Button, Flex, Text } from "@mantine/core";

interface PageError {
    reset: () => void;
}

const PageError: FC<PageError> = ({ reset }) => (
    <Flex
        w="100%"
        h="100%"
        justify="center"
        align="center"
        style={{ minHeight: "inherit" }}
    >
        <Flex direction="column" justify="center" align="center">
            <Text size="xl" fw={600} mb={8}>
                Something went wrong!
            </Text>
            <Button onClick={reset}>Try again</Button>
        </Flex>
    </Flex>
);

export default PageError;
