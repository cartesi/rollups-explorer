import { Group, Stack, Title } from "@mantine/core";
import { TbInbox } from "react-icons/tb";
import { Metadata } from "next";
import Inputs from "../../components/inputs";
import Breadcrumbs from "../../components/breadcrumbs";

export const metadata: Metadata = {
    title: "Inputs",
};

export default function InputsPage() {
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
                <TbInbox size={40} />
                <Title order={2}>Inputs</Title>
            </Group>

            <Inputs />
        </Stack>
    );
}
