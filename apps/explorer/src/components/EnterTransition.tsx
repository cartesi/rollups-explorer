import { Transition, type MantineTransition } from "@mantine/core";
import { useEffect, useState, type FC, type ReactNode } from "react";

export interface EnterTransitionProps {
    children: ReactNode;

    /**
     * Transition played once the content mounts.
     */
    transition?: MantineTransition;
}

/**
 * Plays an entrance transition when its content mounts, such as a tab panel
 * rendered only while active.
 */
export const EnterTransition: FC<EnterTransitionProps> = ({
    children,
    transition = "fade-up",
}) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <Transition
            mounted={mounted}
            transition={transition}
            duration={250}
            timingFunction="ease"
        >
            {(styles) => <div style={styles}>{children}</div>}
        </Transition>
    );
};
