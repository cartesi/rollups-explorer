import { useIntersection } from "@mantine/hooks";
import { useMemo } from "react";

export const useElementVisibility = (
    element: HTMLDivElement | null,
    threshold = 0.5,
) => {
    const { ref: childrenRef, entry } = useIntersection({
        root: element,
        threshold,
    });
    const isVisible = (entry?.intersectionRatio ?? 1) < threshold;
    return useMemo(
        () => ({ childrenRef, isVisible }),
        [childrenRef, isVisible],
    );
};
