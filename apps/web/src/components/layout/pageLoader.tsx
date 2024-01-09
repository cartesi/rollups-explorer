import type { FC } from "react";
import { Flex, Loader } from "@mantine/core";

const PageLoader: FC = () => (
    <Flex
        w="100%"
        h="100%"
        justify="center"
        align="center"
        style={{ minHeight: "inherit" }}
    >
        <Loader data-testid="page-spinner" />
    </Flex>
);

export default PageLoader;
