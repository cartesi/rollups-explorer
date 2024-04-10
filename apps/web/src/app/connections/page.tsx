import { Stack } from "@mantine/core";
import { Metadata } from "next";
import Connections from "../../components/connection/connections";
import Breadcrumbs from "../../components/breadcrumbs";

export const metadata: Metadata = {
    title: "Connections",
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

            <Connections />
        </Stack>
    );
}
