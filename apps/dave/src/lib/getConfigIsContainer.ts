export const getConfiguredIsContainer = () => {
    const IS_CONTAINER = process.env.NEXT_PUBLIC_IS_CONTAINER ?? "false";
    return IS_CONTAINER.toLowerCase() === "true";
};
