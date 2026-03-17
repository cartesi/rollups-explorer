import { Stack, type StackProps } from "@mantine/core";
import type { FC } from "react";

/**
 * Standard layout component to be shared among page containers.
 * It wraps a Mantine's stack element to keep layout consistent
 * across pages.
 * @param props
 */
const ContainerStack: FC<StackProps> = (props) => {
    return (
        <Stack my="xl" gap="lg" {...props}>
            {props.children}
        </Stack>
    );
};

export default ContainerStack;
