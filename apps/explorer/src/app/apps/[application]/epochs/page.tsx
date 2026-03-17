import { EpochsContainer } from "../../../../containers/EpochsContainer";
import { toBoolean, toNumber } from "../../../../util";

export default async function Page(
    props: PageProps<"/apps/[application]/epochs">,
) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const descending = toBoolean(searchParams.descending, true);
    const limit = toNumber(searchParams.limit);
    const offset = toNumber(searchParams.offset);
    return (
        <EpochsContainer
            {...params}
            descending={descending}
            limit={limit}
            offset={offset}
        />
    );
}
