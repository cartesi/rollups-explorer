import { useMemo } from "react";
import { systemSpecification, systemSpecificationAsList } from "../systemSpecs";

/**
 * Specifications provided by the system i.e. for portals and relays.
 * @returns
 */
export const useSystemSpecifications = () => {
    return useMemo(
        () => ({
            ...systemSpecification,
            systemSpecificationAsList,
        }),
        [],
    );
};
