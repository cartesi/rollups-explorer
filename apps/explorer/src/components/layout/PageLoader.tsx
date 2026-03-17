import { Flex } from "@mantine/core";
import type { FC } from "react";
import CartesiLogo from "../icons/CartesiLogo";

const PageLoader: FC = () => (
    <Flex
        justify="center"
        align="center"
        top={0}
        bottom={0}
        right={0}
        left={0}
        style={{ position: "absolute" }}
    >
        <CartesiLogo height={55} />
    </Flex>
);

export default PageLoader;
