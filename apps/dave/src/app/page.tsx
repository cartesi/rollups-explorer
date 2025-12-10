import { ApplicationsContainer } from "../containers/ApplicationsContainer";
import { toBoolean, toNumber } from "../util";

export default async function Page(props: PageProps<"/">) {
    const searchParams = await props.searchParams;
    const descending = toBoolean(searchParams.descending, true);
    const limit = toNumber(searchParams.limit);
    const offset = toNumber(searchParams.offset);
    return (
        <ApplicationsContainer
            descending={descending}
            limit={limit}
            offset={offset}
        />
    );
}
