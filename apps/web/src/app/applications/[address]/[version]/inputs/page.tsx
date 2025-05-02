import { Stack, Text } from "@mantine/core";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { FC } from "react";
import { TbInbox } from "react-icons/tb";
import { Address as AddressType } from "viem";
import Address from "../../../../../components/address";
import Breadcrumbs from "../../../../../components/breadcrumbs";
import Inputs from "../../../../../components/inputs/inputs";
import PageTitle from "../../../../../components/layout/pageTitle";
import {
    ApplicationByIdDocument,
    ApplicationByIdQuery,
    ApplicationByIdQueryVariables,
} from "../../../../../graphql/explorer/operations";
import getConfiguredChainId from "../../../../../lib/getConfiguredChain";
import { getUrqlServerClient } from "../../../../../lib/urql";

export async function generateMetadata(
    props: ApplicationInputsPageProps,
): Promise<Metadata> {
    const params = await props.params;
    return {
        title: `Application ${params.address}`,
    };
}

async function getApplication(appId: string) {
    const client = getUrqlServerClient();
    const result = await client.query<
        ApplicationByIdQuery,
        ApplicationByIdQueryVariables
    >(ApplicationByIdDocument, {
        id: appId.toLowerCase(),
    });

    return result.data?.applicationById;
}

export type ApplicationInputsPageProps = {
    params: Promise<{ address: string; version: string }>;
};

const ApplicationInputsPage: FC<ApplicationInputsPageProps> = async (props) => {
    const params = await props.params;
    const chainId = getConfiguredChainId();
    const appId = `${chainId}-${params.address?.toLowerCase()}-${
        params.version
    }`;
    const application = await getApplication(appId);

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
                    shorten
                    canCopy={false}
                    href={`/applications/${params.address}/${params.version}`}
                />
                <Text>Inputs</Text>
            </Breadcrumbs>

            <PageTitle title="Inputs" Icon={TbInbox} />
            <Inputs
                appAddress={application.address}
                appVersion={application.rollupVersion}
            />
        </Stack>
    );
};

export default ApplicationInputsPage;
