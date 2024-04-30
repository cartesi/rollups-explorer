import { Stack } from "@mantine/core";
import { Metadata } from "next";
import ConnectionView from "../../components/connection/connectionView";
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

            <ConnectionView />
        </Stack>
    );
}
