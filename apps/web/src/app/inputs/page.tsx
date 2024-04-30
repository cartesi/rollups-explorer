import { Group, Stack, Title } from "@mantine/core";
import { TbInbox } from "react-icons/tb";
import { Metadata } from "next";
import Inputs from "../../components/inputs/inputs";
import Breadcrumbs from "../../components/breadcrumbs";
import PageHeading from "../../components/layout/pageHeading";

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

            <PageHeading heading="Inputs" Icon={TbInbox} />
            <Inputs />
        </Stack>
    );
}
