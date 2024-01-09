import { Group, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import { FC } from "react";
import { TbInbox } from "react-icons/tb";
import Address from "../../../components/address";
import Breadcrumbs from "../../../components/breadcrumbs";
import Inputs from "../../../components/inputs";

export type ApplicationPageProps = {
    params: { address: string };
};

export async function generateMetadata({
    params,
}: ApplicationPageProps): Promise<Metadata> {
    return {
        title: `Application ${params.address}`,
    };
}

const ApplicationPage: FC<ApplicationPageProps> = ({ params }) => {
    return (
        <Stack>
            <Breadcrumbs
                breadcrumbs={[
                    {
                        href: "/",
                        label: "Home",
                    },
                    {
                        href: "/applications",
                        label: "Applications",
                    },
                ]}
            >
                <Address value={params.address as Address} icon />
            </Breadcrumbs>

            <Group>
                <TbInbox size={40} />
                <Title order={2}>Inputs</Title>
            </Group>

            <Inputs applicationId={params.address} />
        </Stack>
    );
};

export default ApplicationPage;
