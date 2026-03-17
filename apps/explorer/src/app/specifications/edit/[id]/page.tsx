import type { Metadata } from "next";
import { EditSpecificationContainer } from "../../../../containers/EditSpecificationContainer";

export const metadata: Metadata = {
    title: "Edit Specifications",
};

export default async function Page(
    props: PageProps<"/specifications/edit/[id]">,
) {
    const params = await props.params;

    return <EditSpecificationContainer id={params.id} />;
}
