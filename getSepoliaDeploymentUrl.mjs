async function main() {
    const [token] = process.argv.slice(2);
    let cartesiTeamId = null;

    try {
        const request = await fetch("https://api.vercel.com/v2/teams", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const response = await request.json();

        cartesiTeamId = response.teams.find(
            (team) => team.slug === "cartesi",
        ).id;
    } catch (error) {
        console.log("Error while retrieving teams data:", error);
    }

    let sepoliaDeploymentUrl = null;

    try {
        const params = new URLSearchParams({
            teamId: cartesiTeamId,
        }).toString();
        const request = await fetch(
            `https://api.vercel.com/v6/deployments?${params}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        const response = await request.json();

        const url = response.deployments.find(
            (team) => team.name === "rollups-explorer-sepolia",
        ).url;

        sepoliaDeploymentUrl = `https://${url}`;
    } catch (error) {
        console.log("Error while retrieving deployments data:", error);
    }

    return sepoliaDeploymentUrl;
}

const url = await main();

process.stdout.write(url);
