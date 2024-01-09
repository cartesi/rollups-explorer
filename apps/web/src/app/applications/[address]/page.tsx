import { Group, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import { FC } from "react";
import { Metadata } from "next";
import gql from "graphql-tag";
import { TbInbox } from "react-icons/tb";
import Address from "../../../components/address";
import Inputs from "../../../components/inputs/inputs";
import Breadcrumbs from "../../../components/breadcrumbs";
import { getUrqlClient } from "../../../lib/urql";
import { notFound } from "next/navigation";

export async function generateMetadata({
    params,
}: ApplicationPageProps): Promise<Metadata> {
    return {
        title: `Application ${params.address}`,
    };
}

async function getApplication(address: string) {
    const client = getUrqlClient();
    const result = await client.query(
        gql`
            query applications($where: ApplicationWhereInput) {
                applications(where: $where, limit: 1) {
                    id
                }
            }
        `,
        {
            where: {
                id_eq: address.toLowerCase(),
            },
        },
    );
    return result.data.applications?.[0];
}

export type ApplicationPageProps = {
    params: { address: string };
};

const ApplicationPage: FC<ApplicationPageProps> = async ({ params }) => {
    const application = await getApplication(params.address);

    if (!application) {
        notFound();
    }

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
