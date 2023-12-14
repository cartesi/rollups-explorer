import { Group, Stack, Title } from "@mantine/core";
import { TbInbox } from "react-icons/tb";
import EntriesSummary from "../components/entriesSummary";
import LatestEntries from "../components/latestEntries";
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

            <Group>
                <TbInbox size={40} />
                <Title order={2}>Inputs</Title>
            </Group>

            <EntriesSummary />
            <LatestEntries />
        </Stack>
    );
}
