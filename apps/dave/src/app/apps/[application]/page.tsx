import { ApplicationSummaryContainer } from "../../../containers/ApplicationSummaryContainer";

export default async function Page(props: PageProps<"/apps/[application]">) {
    const { application } = await props.params;
    return <ApplicationSummaryContainer application={application} />;
}
