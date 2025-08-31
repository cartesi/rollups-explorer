import { Vercel } from "@vercel/sdk";

/**
 * @description The script in this file is used by .github/workflows/e2e.yml
 * to provide the sepolia deployment url
 */

/**
 * @description Gets the latest Sepolia deployment url
 * @returns {Promise<string>}
 */
async function main() {
    const token = process.env.VERCEL_TOKEN;
    const githubSha = process.env.GITHUB_SHA;
    let sepoliaDeploymentUrl = null;

    try {
        const vercel = new Vercel({
            bearerToken: token,
        });

        const teamsResult = await vercel.teams.getTeams({
            limit: 20,
        });

        const cartesiTeamId = teamsResult.teams.find(
            (team) => team.slug === "cartesi",
        )?.id;

        const deploymentsResult = await vercel.deployments.getDeployments({
            app: "rollups-explorer-sepolia",
            teamId: cartesiTeamId,
            sha: githubSha,
        });

        const [latestDeployment] = deploymentsResult.deployments;

        return latestDeployment.url;
    } catch (error) {
        console.error("Error while retrieving deployment data:", error);
        process.exit(1);
    }

    return `https://${sepoliaDeploymentUrl}`;
}

const url = await main();

process.stdout.write(url);
