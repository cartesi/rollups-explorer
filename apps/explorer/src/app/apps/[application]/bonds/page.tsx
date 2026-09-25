import { BondsContainer } from "../../../../containers/BondsContainer";

export default async function Page(
    props: PageProps<"/apps/[application]/bonds">,
) {
    const params = await props.params;
    return <BondsContainer application={params.application} />;
}
