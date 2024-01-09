import { Group, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import { TbApps } from "react-icons/tb";
import Applications from "../../components/applications/applications";
import Breadcrumbs from "../../components/breadcrumbs";

export const metadata: Metadata = {
    title: "Applications",
};

export default function ApplicationsPage() {
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

            <Group>
                <TbApps size={40} />
                <Title order={2}>Applications</Title>
            </Group>

            <Applications />
        </Stack>
    );
}
