"use client";
import {
    useApplicationsConnectionQuery,
    useInputsQuery,
} from "@cartesi/rollups-explorer-domain/explorer-hooks";
import {
    ApplicationOrderByInput,
    InputOrderByInput,
} from "@cartesi/rollups-explorer-domain/explorer-types";
import {
    Button,
    Card,
    Grid,
    Group,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import type { FC } from "react";
import { IconType } from "react-icons";
import { TbApps, TbInbox } from "react-icons/tb";
import type { Address as AddressType } from "viem";
import { checkApplicationsQuery } from "../lib/query";
import { useAppConfig } from "../providers/appConfigProvider";
import LatestEntriesTable, { Entry } from "./latestEntriesTable";

interface LatestEntriesCard {
    title: string;
    Icon: IconType;
    entries: Entry[];
    fetching: boolean;
    totalCount: number;
    viewAllText: string;
    viewAllHref: string;
}

export const LatestEntriesCard: FC<LatestEntriesCard> = (props) => {
    const {
        title,
        Icon,
        entries,
        fetching,
        totalCount,
        viewAllText,
        viewAllHref,
    } = props;
    const theme = useMantineTheme();
    const isSmallDevice = useMediaQuery(`(max-width:${theme.breakpoints.sm})`);

    return (
        <Card h="100%">
            <Group gap={5} align="center">
                <Icon size={20} />
                <Text c="dimmed" lh={1}>
                    {title}
                </Text>
            </Group>

            <Group gap={5} style={{ overflowX: "auto" }}>
                <LatestEntriesTable
                    entries={entries}
                    fetching={fetching}
                    totalCount={totalCount}
                />
            </Group>

            <Group gap={5} mt="auto">
                <Button
                    component={Link}
                    href={viewAllHref}
                    variant="light"
                    fullWidth={isSmallDevice}
                    mt="md"
                    mx="auto"
                    radius="md"
                    tt="uppercase"
                >
                    {viewAllText}
                </Button>
            </Group>
        </Card>
    );
};

const LatestEntries: FC = () => {
    const { chainId: chainIdConfigured } = useAppConfig();
    const [{ data: inputsData, fetching: isFetchingInputs }] = useInputsQuery({
        variables: {
            orderBy: InputOrderByInput.TimestampDesc,
            limit: 6,
            chainId: chainIdConfigured,
        },
    });
    const [{ data: applicationsData, fetching: isFetchingApplications }] =
        useApplicationsConnectionQuery({
            variables: {
                orderBy: ApplicationOrderByInput.TimestampDesc,
                limit: 6,
                where: checkApplicationsQuery({
                    chainId: chainIdConfigured,
                }),
            },
        });
    const inputs =
        inputsData?.inputsConnection.edges.map((edge) => ({
            appId: edge.node.application.id,
            appAddress: edge.node.application.address as AddressType,
            timestamp: Number(edge.node.timestamp),
            href: `/applications/${edge.node.application.address}/${edge.node.application.rollupVersion}/inputs`,
        })) ?? [];
    const applications =
        applicationsData?.applicationsConnection.edges.map((edge) => ({
            appId: edge.node.id,
            appAddress: edge.node.address as AddressType,
            timestamp: Number(edge.node.timestamp),
            href: `/applications/${edge.node.address}/${edge.node.rollupVersion}`,
        })) ?? [];

    return (
        <Grid gutter="md">
            <Grid.Col
                span={{ base: 12, md: 6 }}
                my="md"
                data-testid="latest-inputs"
            >
                <LatestEntriesCard
                    title="Latest inputs"
                    Icon={TbInbox}
                    entries={inputs}
                    fetching={isFetchingInputs}
                    totalCount={inputsData?.inputsConnection.totalCount ?? 0}
                    viewAllText="View all inputs"
                    viewAllHref="/inputs"
                />
            </Grid.Col>

            <Grid.Col
                span={{ base: 12, md: 6 }}
                my="md"
                data-testid="latest-applications"
            >
                <LatestEntriesCard
                    title="Latest applications"
                    Icon={TbApps}
                    entries={applications}
                    fetching={isFetchingApplications}
                    totalCount={
                        applicationsData?.applicationsConnection.totalCount ?? 0
                    }
                    viewAllText="View all applications"
                    viewAllHref="/applications"
                />
            </Grid.Col>
        </Grid>
    );
};

export default LatestEntries;
