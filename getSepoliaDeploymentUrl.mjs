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
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const token = process.env.VERCEL_TOKEN;
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const githubSha = process.env.GITHUB_SHA;
    let cartesiTeamId = null;
    let sepoliaDeploymentUrl = null;

    return console.log(
        "env::",
        process.env.VERCEL_TOKEN,
        process.env.GITHUB_SHA,
    );

    const vercel = new Vercel({
        bearerToken: token,
    });

    try {
        const teamsResult = await vercel.teams.getTeams({
            limit: 20,
        });

        cartesiTeamId = teamsResult.teams.find(
            (team) => team.slug === "cartesi",
        ).id;

        console.log("cartesiTeamId::", cartesiTeamId);

        const deploymentsResult = await vercel.deployments.getDeployments({
            app: "rollups-explorer",
            teamId: cartesiTeamId,
            sha: githubSha,
        });

        sepoliaDeploymentUrl = deploymentsResult?.url;

        if (!sepoliaDeploymentUrl) {
            throw new Error("Could not find deployment url for Sepolia");
        }
    } catch (error) {
        console.error("Error while retrieving deployment data:", error);
        process.exit(1);
    }

    return `https://${sepoliaDeploymentUrl}`;
}

const url = await main();

process.stdout.write(url);
