import { Stack } from "@mantine/core";
import { Metadata } from "next";
import { TbApps } from "react-icons/tb";
import { Applications } from "../../components/applications/applications";
import Breadcrumbs from "../../components/breadcrumbs";
import PageTitle from "../../components/layout/pageTitle";

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

            <PageTitle title="Applications" Icon={TbApps} />
            <Applications />
        </Stack>
    );
}
