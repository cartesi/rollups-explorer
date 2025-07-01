import { isNilOrEmpty } from "ramda-adjunct";

/**
 * Return the configured public explorer-api-url.
 * It is meant to be used with server-side capability to provide dinamyc configuration capability for multiple
 * running explorers in the same host.
 *
 */
export const getConfiguredPublicExplorerAPI = () => {
    const api =
        process.env.EXPLORER_API_URL ||
        process.env.NEXT_PUBLIC_EXPLORER_API_URL;

    if (isNilOrEmpty(api)) {
        console.warn(
            `Neither EXPLORER_API_URL nor NEXT_PUBLIC_EXPLORER_API_URL are defined. At least one is required.`,
        );
    }
    return api;
};
