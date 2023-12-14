import { Group, Stack, Title } from "@mantine/core";
import { TbInbox } from "react-icons/tb";
import Inputs from "../components/inputs";
import EntriesSummary from "../components/entriesSummary";
import Breadcrumbs from "../components/breadcrumbs";

export default function HomePage() {
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

            <EntriesSummary />

            <Group>
                <TbInbox size={40} />
                <Title order={2}>Inputs</Title>
            </Group>

            <Inputs />
        </Stack>
    );
}
