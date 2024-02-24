import { Group, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { FC } from "react";
import { TbInbox } from "react-icons/tb";
import Address from "../../../components/address";
import Breadcrumbs from "../../../components/breadcrumbs";
import Inputs from "../../../components/inputs/inputs";
import {
    ApplicationByIdDocument,
    ApplicationByIdQuery,
    ApplicationByIdQueryVariables,
} from "../../../graphql/explorer/operations";
import { getUrqlServerClient } from "../../../lib/urql";

export async function generateMetadata({
    params,
}: ApplicationPageProps): Promise<Metadata> {
    return {
        title: `Application ${params.address}`,
    };
}

async function getApplication(address: string) {
    const client = getUrqlServerClient();
    const result = await client.query<
        ApplicationByIdQuery,
        ApplicationByIdQueryVariables
    >(ApplicationByIdDocument, {
        id: address.toLowerCase(),
    });

    return result.data?.applicationById;
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
