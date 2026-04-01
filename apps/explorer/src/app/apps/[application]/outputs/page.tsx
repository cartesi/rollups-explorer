import { OutputsContainer } from "../../../../containers/OutputsContainer";
import { toBoolean, toNumber } from "../../../../util";

export default async function Page(
    props: PageProps<"/apps/[application]/outputs">,
) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const descending = toBoolean(searchParams.descending, true);
    const limit = toNumber(searchParams.limit);
    const offset = toNumber(searchParams.offset);
    return (
        <OutputsContainer
            {...params}
            descending={descending}
            limit={limit}
            offset={offset}
        />
    );
}
