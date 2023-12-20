import { Stack } from "@mantine/core";
import Breadcrumbs from "../components/breadcrumbs";
import EntriesSummary from "../components/entriesSummary";
import LatestEntries from "../components/latestEntries";

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
            <LatestEntries />
        </Stack>
    );
}
