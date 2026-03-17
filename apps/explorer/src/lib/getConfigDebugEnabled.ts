import { defaultTo } from "ramda";

export const getConfiguredDebugEnabled = () => {
    const isDebugEnabled =
        process.env.DEBUG_ENABLED || process.env.NEXT_PUBLIC_DEBUG_ENABLED;

    return defaultTo(false, isDebugEnabled === "true");
};
