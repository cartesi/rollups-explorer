import { Card, Container, Group, Stack, Text, Title } from "@mantine/core";
import { Metadata } from "next";
import Link from "next/link";
import { RedirectType, notFound, redirect } from "next/navigation";
import { isNotNilOrEmpty } from "ramda-adjunct";
import { FC } from "react";
import { TbStack2 } from "react-icons/tb";
import { Address as AddressType, Hex } from "viem";
import Address from "../../../components/address";
import Breadcrumbs from "../../../components/breadcrumbs";
import PageTitle from "../../../components/layout/pageTitle";
import {
    ApplicationsDocument,
    ApplicationsQuery,
    ApplicationsQueryVariables,
} from "../../../graphql/explorer/operations";
import getConfiguredChainId from "../../../lib/getConfiguredChain";
import { getUrqlServerClient } from "../../../lib/urql";

export async function generateMetadata(
    props: ApplicationPageProps,
): Promise<Metadata> {
    const params = await props.params;
    return {
        title: `Application ${params.address}`,
    };
}

async function getApplicationBy(address: string, chainId: string) {
    const client = getUrqlServerClient();
    const result = await client.query<
        ApplicationsQuery,
        ApplicationsQueryVariables
    >(ApplicationsDocument, {
        limit: 10,
        where: {
            address_eq: address?.toLowerCase(),
            chain: {
                id_eq: chainId,
            },
        },
    });

    return result.data?.applications;
}

export type ApplicationPageProps = {
    params: Promise<{ address: string }>;
};

const ApplicationPage: FC<ApplicationPageProps> = async (props) => {
    const params = await props.params;
    const chainId = getConfiguredChainId();
    const applications =
        (await getApplicationBy(params.address, chainId)) ?? [];
    const foundApps = isNotNilOrEmpty(applications);
    const hasMoreThanOne = applications.length > 1;

    if (!foundApps) {
        notFound();
    }

    if (!hasMoreThanOne) {
        const [app] = applications;
        redirect(
            `/applications/${app.address}/${app.rollupVersion}`,
            RedirectType.replace,
        );
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
                />
            </Breadcrumbs>

            <PageTitle title="Summary" Icon={TbStack2} />
            <Stack>
                <Container size="lg">
                    <Title order={3} c="dimmed">
                        We found the following apps with this address
                    </Title>
                    <Title order={4} fw="bold">
                        Choose one
                    </Title>
                    {applications.map((app) => (
                        <Card
                            key={app.id}
                            my="lg"
                            component={Link}
                            href={`/applications/${app.address}/${app.rollupVersion}`}
                        >
                            <Group justify="center" gap={1}>
                                <Address
                                    value={app.address as Hex}
                                    icon
                                    shorten
                                />
                                <Text c="dimmed" size="xs" fw="bold">
                                    Rollups {app.rollupVersion}
                                </Text>
                            </Group>
                        </Card>
                    ))}
                </Container>
            </Stack>
        </Stack>
    );
};

export default ApplicationPage;
