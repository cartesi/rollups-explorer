import { Button, Group, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import Link from "next/link";
import { TbFileCode } from "react-icons/tb";
import Breadcrumbs from "../../components/breadcrumbs";
import { SpecificationListView } from "../../components/specification/SpecificationListView";

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

            <Group>
                <Button component={Link} href="/specifications/new">
                    New
                </Button>
            </Group>

            <SpecificationListView />
        </Stack>
    );
}
