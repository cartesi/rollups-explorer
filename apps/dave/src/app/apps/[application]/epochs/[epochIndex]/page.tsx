import { EpochContainer } from "../../../../../containers/EpochContainer";
import { toBoolean, toNumber } from "../../../../../util";

export default async function Page(
    props: PageProps<"/apps/[application]/epochs/[epochIndex]">,
) {
    const params = await props.params;
    const application = params.application;
    const epochIndex = BigInt(params.epochIndex);

    const searchParams = await props.searchParams;
    const descending = toBoolean(searchParams.descending, true);
    const limit = toNumber(searchParams.limit);
    const offset = toNumber(searchParams.offset);

    return (
        <EpochContainer
            application={application}
            descending={descending}
            epochIndex={epochIndex}
            limit={limit}
            offset={offset}
        />
    );
}
