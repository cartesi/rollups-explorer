import { Group, Stack, Title } from "@mantine/core";
import { TbInbox } from "react-icons/tb";
import { Metadata } from "next";
import Inputs from "../../components/inputs/inputs";
import Breadcrumbs from "../../components/breadcrumbs";
import PageTitle from "../../components/layout/pageTitle";

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

            <PageTitle title="Inputs" Icon={TbInbox} />
            <Inputs />
        </Stack>
    );
}
