import { getAddress, type Hash } from "viem";
import { MatchContainer } from "../../../../../../../../../containers/MatchContainer";

export default async function Page(
    props: PageProps<"/apps/[application]/epochs/[epochIndex]/tournaments/[tournamentAddress]/matches/[idHash]">,
) {
    const params = await props.params;
    const application = params.application;
    const epochIndex = BigInt(params.epochIndex);
    const tournamentAddress = getAddress(params.tournamentAddress);
    const idHash = params.idHash as Hash;

    return (
        <MatchContainer
            application={application}
            epochIndex={epochIndex}
            tournamentAddress={tournamentAddress}
            idHash={idHash}
        />
    );
}
