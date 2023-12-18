import { useIntersection } from "@mantine/hooks";
import { useMemo } from "react";
type UseElementVisibilityParamsProps<T extends Element> = {
    element: React.RefObject<T>;
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
