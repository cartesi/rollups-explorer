/**
 * Return configuration to internal endpoints e.g. when using docker in a compose setup
 * That allows the explorer internal server-to-server calls to reach other containers.
 */
export const getConfiguredInternalExplorerAPI = () => {
    const api = process.env.INTERNAL_EXPLORER_API_URL;
    return api;
};
