import { Stack } from "@mantine/core";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { FC } from "react";
import { TbStack2 } from "react-icons/tb";
import { Address as AddressType } from "viem";
import Address from "../../../../components/address";
import ApplicationSummary from "../../../../components/applications/applicationSummary";
import Breadcrumbs from "../../../../components/breadcrumbs";
import PageTitle from "../../../../components/layout/pageTitle";
import {
    ApplicationByIdDocument,
    ApplicationByIdQuery,
    ApplicationByIdQueryVariables,
} from "@cartesi/rollups-explorer-domain/explorer-operations";
import getConfiguredChainId from "../../../../lib/getConfiguredChain";
import { getUrqlServerClient } from "../../../../lib/urql";

export async function generateMetadata(
    props: ApplicationPageProps,
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
        id: appId,
    });

    return result.data?.applicationById;
}

export type ApplicationPageProps = {
    params: Promise<{ address: string; version: string }>;
};

const ApplicationPage: FC<ApplicationPageProps> = async (props) => {
    const params = await props.params;
    const chainId = getConfiguredChainId();
    const address = params.address?.toLowerCase();
    const appId = `${chainId}-${address}-${params.version}`;
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
                <Address value={params.address as AddressType} icon />
            </Breadcrumbs>

            <PageTitle title="Summary" Icon={TbStack2} />
            <ApplicationSummary
                appAddress={application.address}
                appVersion={application.rollupVersion}
            />
        </Stack>
    );
};

export default ApplicationPage;
