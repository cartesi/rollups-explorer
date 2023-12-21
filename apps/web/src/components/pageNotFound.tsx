"use client";

import { FC } from "react";
import { Button, Flex, Text } from "@mantine/core";
import { useRouter } from "next/navigation";

const PageNotFound: FC = () => {
    const router = useRouter();

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
                <Text size="md" fw={500} mb={18}>
                    Could not find the requested resource.
                </Text>
                <Button onClick={router.back}>Go back</Button>
            </Flex>
        </Flex>
    );
};

export default PageNotFound;
