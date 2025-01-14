import { useIntersection } from "@mantine/hooks";
import { RefObject, useMemo } from "react";

type UseElementVisibilityParamsProps<T extends Element> = {
    element: RefObject<T | null>;
    threshold?: number;
};

export const useElementVisibility = <T extends Element>({
    element,
    threshold = 0.5,
}: UseElementVisibilityParamsProps<T>) => {
    const { ref: childrenRef, entry } = useIntersection({
        root: element.current,
        threshold,
    });
    const isVisible = (entry?.intersectionRatio ?? 1) < threshold;
    return useMemo(
        () => ({ childrenRef, isVisible }),
        [childrenRef, isVisible],
    );
};
