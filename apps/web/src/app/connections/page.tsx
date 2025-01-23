import { Stack } from "@mantine/core";
import { Metadata } from "next";
import { TbPlugConnected } from "react-icons/tb";
import Breadcrumbs from "../../components/breadcrumbs";
import ConnectionView from "../../components/connection/connectionView";
import PageTitle from "../../components/layout/pageTitle";

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

            <PageTitle title="Connections" Icon={TbPlugConnected} />

            <ConnectionView />
        </Stack>
    );
}
