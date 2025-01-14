import { Group, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import { TbFileCode } from "react-icons/tb";
import Breadcrumbs from "../../../../components/breadcrumbs";
import { SpecificationContainer } from "../../../../components/specification/SpecificationContainer";

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

            <Group mb="xl">
                <TbFileCode size={40} />
                <Title order={1}>Edit Specifications</Title>
            </Group>

            <SpecificationContainer specificationId={params.id} />
        </Stack>
    );
}
