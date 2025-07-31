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

    return cartesiTeamId;
}

const data = await main();

process.stdout.write(data);
