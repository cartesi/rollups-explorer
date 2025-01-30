import { Stack } from "@mantine/core";
import { Metadata } from "next";
import { TbFileCode } from "react-icons/tb";
import Breadcrumbs from "../../../components/breadcrumbs";
import { SpecificationContainer } from "../../../components/specification/SpecificationContainer";
import PageTitle from "../../../components/layout/pageTitle";

export const metadata: Metadata = {
    title: "New Specification",
};

export default function NewSpecificationPage() {
    return (
        <Stack>
            <Breadcrumbs
                breadcrumbs={[
                    {
                        href: "/",
                        label: "Home",
                    },
                    {
                        href: "/specifications",
                        label: "Specifications",
                    },
                ]}
            />

            <PageTitle title="Create a Specification" Icon={TbFileCode} />

            <SpecificationContainer />
        </Stack>
    );
}
