import { Group, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import { TbFileCode } from "react-icons/tb";
import Breadcrumbs from "../../../components/breadcrumbs";
import { SpecificationCreationView } from "../../../components/specification/specificationCreationView";

export const metadata: Metadata = {
    title: "Decoding Specifications",
};

export default function SpecificationsPage() {
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
                <Title order={1}>Create a Specification</Title>
            </Group>

            <SpecificationCreationView />
        </Stack>
    );
}
