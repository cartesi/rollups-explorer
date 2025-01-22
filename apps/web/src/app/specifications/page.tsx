import { Stack } from "@mantine/core";
import { Metadata } from "next";
import { TbFileCode } from "react-icons/tb";
import Breadcrumbs from "../../components/breadcrumbs";
import PageTitle from "../../components/layout/pageTitle";
import { SpecificationListView } from "../../components/specification/SpecificationListView";

export const metadata: Metadata = {
    title: "Specifications",
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

            <PageTitle title="Specifications" Icon={TbFileCode} />

            <SpecificationListView />
        </Stack>
    );
}
