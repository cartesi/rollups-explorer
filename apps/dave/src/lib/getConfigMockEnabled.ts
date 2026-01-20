import { defaultTo } from "ramda";

export const getConfiguredMockEnabled = () => {
    const isMockEnabled =
        process.env.MOCK_ENABLED || process.env.NEXT_PUBLIC_MOCK_ENABLED;

    return defaultTo(false, isMockEnabled === "true");
};
