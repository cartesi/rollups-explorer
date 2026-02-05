import { Stack, type StackProps } from "@mantine/core";
import type { FC } from "react";

/**
 * All container has a stack but the padding. margin and gaps were slightly different
 * showing a bit of difference between page navigation. the goal is to all containers
 * to use this Stack, just a still configurable Stack with sensible defaults for containers.
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
