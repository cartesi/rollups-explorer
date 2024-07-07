import { Group, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import { TbFileCode } from "react-icons/tb";
import Breadcrumbs from "../../components/breadcrumbs";
import { SpecificationView } from "../../components/specification/specificationView";

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
                ]}
            />

            <Group mb="xl">
                <TbFileCode size={40} />
                <Title order={1}>Specifications</Title>
            </Group>

            <SpecificationView />
        </Stack>
    );
}
