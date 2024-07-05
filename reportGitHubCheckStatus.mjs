import { createActionAuth } from '@octokit/auth-action';
import { Octokit } from '@octokit/rest';

async function main() {
    const args = process.argv.slice(2);
    const auth = createActionAuth();
    const authentication = await auth();
    const octokit = new Octokit({
        auth: authentication.token,
    });

    await octokit.rest.repos.createCommitStatus({
        owner: 'cartesi',
        repo: 'rollups-explorer',
        context: args[0],
        sha: args[1],
        state: args[2],
    });
}

main();