import { Stack } from "@mantine/core";
import { Metadata } from "next";
import { TbFileCode } from "react-icons/tb";
import Breadcrumbs from "../../../../components/breadcrumbs";
import { SpecificationContainer } from "../../../../components/specification/SpecificationContainer";
import PageTitle from "../../../../components/layout/pageTitle";

export const metadata: Metadata = {
    title: "Edit Specifications",
};

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditSpecificationPage(props: PageProps) {
    const params = await props.params;
    return (
        <Stack>
            <Breadcrumbs
                breadcrumbs={[
                    {
                        href: "/",
                        label: "Home",
                    },
                    {
                        href: "/specifications",
                        label: "Specifications",
                    },
                ]}
            />

            <PageTitle title="Edit Specifications" Icon={TbFileCode} />

            <SpecificationContainer specificationId={params.id} />
        </Stack>
    );
}
