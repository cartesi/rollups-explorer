import { OutputsContainer } from "../../../../containers/OutputsContainer";

export default async function Page(
    props: PageProps<"/apps/[application]/outputs">,
) {
    const params = await props.params;
    return <OutputsContainer application={params.application} />;
}
