import { Group, Stack, Text, Title } from "@mantine/core";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { FC } from "react";
import { TbInbox } from "react-icons/tb";
import { Address as AddressType } from "viem";
import Address from "../../../../components/address";
import Breadcrumbs from "../../../../components/breadcrumbs";
import Inputs from "../../../../components/inputs/inputs";
import {
    ApplicationByIdDocument,
    ApplicationByIdQuery,
    ApplicationByIdQueryVariables,
} from "../../../../graphql/explorer/operations";
import { getUrqlServerClient } from "../../../../lib/urql";

export async function generateMetadata({
    params,
}: ApplicationInputsPageProps): Promise<Metadata> {
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

export type ApplicationInputsPageProps = {
    params: { address: string };
};

const ApplicationInputsPage: FC<ApplicationInputsPageProps> = async ({
    params,
}) => {
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
                <Address
                    value={params.address as AddressType}
                    href={`/applications/${params.address}`}
                />
                <Text>Inputs</Text>
            </Breadcrumbs>

            <Group>
                <TbInbox size={40} />
                <Title order={2}>Inputs</Title>
            </Group>

            <Inputs applicationId={params.address} />
        </Stack>
    );
};

export default ApplicationInputsPage;
