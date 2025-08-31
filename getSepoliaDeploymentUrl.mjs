import { Vercel } from "@vercel/sdk";

/**
 * @description The script in this file is used by .github/workflows/e2e.yml
 * to provide the sepolia deployment url
 */

/**
 * @description Gets the deployment url for a given environment
 * @param token
 * @param githubSha
 * @param app
 * @returns {Promise<string>}
 */
async function getDeploymentUrl(token, githubSha, app) {
    const vercel = new Vercel({
        bearerToken: token,
    });

    const teamsResult = await vercel.teams.getTeams({
        limit: 20,
    });

    const cartesiTeamId = teamsResult.teams.find(
        (team) => team.slug === "cartesi",
    )?.id;

    if (!cartesiTeamId) {
        throw new Error("Could not find team id for Cartesi");
    }

    const deploymentsResult = await vercel.deployments.getDeployments({
        app,
        teamId: cartesiTeamId,
        sha: githubSha,
    });

    const [latestDeployment] = deploymentsResult.deployments;

    if (!latestDeployment?.url) {
        throw new Error(`Could not find deployment url for ${app}`);
    }

    return latestDeployment.url;
}

/**
 * @description Gets the latest Sepolia deployment url
 * @returns {Promise<string>}
 */
async function main() {
    const token = process.env.VERCEL_TOKEN;
    const githubSha = process.env.GITHUB_SHA;
    let sepoliaDeploymentUrl = null;

    try {
        // sepoliaDeploymentUrl = await getDeploymentUrl(
        //     token,
        //     githubSha,
        //     "rollups-explorer-sepolia",
        // );
        const vercel = new Vercel({
            bearerToken: token,
        });

        const teamsResult = await vercel.teams.getTeams({
            limit: 20,
        });

        const cartesiTeamId = teamsResult.teams.find(
            (team) => team.slug === "cartesi",
        )?.id;

        if (!cartesiTeamId) {
            throw new Error("Could not find team id for Cartesi");
        }

        const deploymentsResult = await vercel.deployments.getDeployments({
            app: "rollups-explorer-sepolia",
            teamId: cartesiTeamId,
            sha: githubSha,
        });

        const [latestDeployment] = deploymentsResult.deployments;

        if (!latestDeployment?.url) {
            throw new Error(
                `Could not find deployment url for "rollups-explorer-sepolia"`,
            );
        }

        return latestDeployment.url;
    } catch (error) {
        console.error("Error while retrieving deployment data:", error);
        process.exit(1);
    }

    return `https://${sepoliaDeploymentUrl}`;
}

const url = await main();

process.stdout.write(url);
