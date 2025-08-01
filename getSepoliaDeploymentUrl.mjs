/**
 * @description The script in this file is used by .github/workflows/e2e.yml
 * to provide the sepolia deployment url
 */

/**
 * @description Fetches data from the Vercel API
 * @param version
 * @param resource
 * @param token
 * @param params
 * @returns {Promise<any>}
 */
const fetchFromVercelApi = async (
    version,
    resource,
    token,
    params = undefined,
) => {
    const baseUrl = "https://api.vercel.com";
    const url = `${baseUrl}/${version}/${resource}${params ? `?${params}` : ""}`;

    const request = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return await request.json();
};

/**
 * @description Gets the available teams
 * @param token
 * @returns {Promise<*>}
 */
const getTeams = async (token) => {
    return fetchFromVercelApi("v2", "teams", token);
};

/**
 * @description Gets the current deployments
 * @param token
 * @param params
 * @returns {Promise<*>}
 */
const getDeployments = async (token, params) => {
    return fetchFromVercelApi("v6", "deployments", token, params);
};

/**
 * @description Gets the latest Sepolia deployment url
 * @returns {Promise<string>}
 */
async function main() {
    const [token] = process.argv.slice(2);
    let cartesiTeamId = null;
    let sepoliaDeploymentUrl = null;

    try {
        const response = await getTeams(token);

        cartesiTeamId = response.teams.find(
            (team) => team.slug === "cartesi",
        ).id;
    } catch (error) {
        console.log("Error while retrieving teams data:", error);
    }

    try {
        const params = new URLSearchParams({
            teamId: cartesiTeamId,
        }).toString();
        const response = await getDeployments(token, params);

        const [latestDeployment] = response.deployments
            .filter(
                (deployment) => deployment.name === "rollups-explorer-sepolia",
            )
            .sort((a, b) => b.created - a.created);

        sepoliaDeploymentUrl = latestDeployment?.url;
    } catch (error) {
        console.log("Error while retrieving deployments data:", error);
    }

    if (!sepoliaDeploymentUrl) {
        throw new Error("Could not find deployment url for Sepolia");
    }

    return `https://${sepoliaDeploymentUrl}`;
}

const url = await main();

process.stdout.write(url);
