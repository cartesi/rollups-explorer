import { notFound } from "next/navigation";
import { getAddress } from "viem";
import { TournamentContainer } from "../../../../../../../containers/TournamentContainer";

export default async function Page(
    props: PageProps<"/apps/[application]/epochs/[epochIndex]/tournaments/[tournamentAddress]">,
) {
    const params = await props.params;
    const application = params.application;
    let epochIndex, tournamentAddress;

    try {
        epochIndex = BigInt(params.epochIndex);
        tournamentAddress = getAddress(params.tournamentAddress);
    } catch (err: unknown) {
        const error = err as Error;
        console.error(error.message);
        return notFound();
    }

    return (
        <TournamentContainer
            application={application}
            epochIndex={epochIndex}
            tournamentAddress={tournamentAddress}
        />
    );
}
