import { getAddress } from "viem";
import { TournamentContainer } from "../../../../../../../containers/TournamentContainer";

export default async function Page(
    props: PageProps<"/apps/[application]/epochs/[epochIndex]/tournaments/[tournamentAddress]">,
) {
    const params = await props.params;
    const application = params.application;
    const epochIndex = BigInt(params.epochIndex);
    const tournamentAddress = getAddress(params.tournamentAddress);

    return (
        <TournamentContainer
            application={application}
            epochIndex={epochIndex}
            tournamentAddress={tournamentAddress}
        />
    );
}
