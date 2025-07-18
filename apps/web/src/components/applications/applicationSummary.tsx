"use client";

import { useInputsConnectionQuery } from "@cartesi/rollups-explorer-domain/explorer-hooks";
import {
    InputOrderByInput,
    RollupVersion,
} from "@cartesi/rollups-explorer-domain/explorer-types";
import { SummaryCard } from "@cartesi/rollups-explorer-ui";
import {
    Button,
    Card,
    Flex,
    Grid,
    Group,
    Skeleton,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import { FC } from "react";
import { TbInbox } from "react-icons/tb";
import { Address } from "viem";
import { useAppConfig } from "../../providers/appConfigProvider";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";
import ConnectionSummary from "../connection/connectionSummary";
import LatestInputsTable from "./latestInputsTable";

const SummarySkeletonCard = () => (
    <Card shadow="xs" w="100%">
        <Skeleton animate={false} height={20} circle mb={18} />
        <Skeleton animate={false} height={8} radius="xl" />
        <Skeleton animate={false} height={8} mt={6} radius="xl" />
        <Skeleton animate={false} height={8} mt={6} width="70%" radius="xl" />
    </Card>
);

export type ApplicationSummaryProps = {
    appAddress: string;
    appVersion: RollupVersion;
};

const ApplicationSummary: FC<ApplicationSummaryProps> = ({
    appAddress,
    appVersion,
}) => {
    const { chainId } = useAppConfig();
    const [{ data, fetching }] = useInputsConnectionQuery({
        variables: {
            orderBy: InputOrderByInput.TimestampDesc,
            limit: 6,
            where: {
                application: {
                    address_eq: appAddress.toLowerCase(),
                    rollupVersion_eq: appVersion,
                    chain: {
                        id_eq: chainId,
                    },
                },
            },
        },
    });
    const inputs = data?.inputsConnection.edges.map((edge) => edge.node) ?? [];
    const inputsTotalCount = data?.inputsConnection.totalCount ?? 0;

    const { getConnection, hasConnection, showConnectionModal } =
        useConnectionConfig();
    const connection = getConnection(appAddress as Address);
    const isAppConnected = hasConnection(appAddress as Address);
    const theme = useMantineTheme();
    const isSmallDevice = useMediaQuery(`(max-width:${theme.breakpoints.sm})`);

    return (
        <Stack>
            <Grid gutter="sm">
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }} mb="sm">
                    <SummaryCard
                        title="Inputs"
                        value={data?.inputsConnection?.totalCount ?? 0}
                        icon={TbInbox}
                    />
                </Grid.Col>

                {isAppConnected ? (
                    <ConnectionSummary url={connection?.url as string} />
                ) : (
                    <Grid.Col
                        span={{ base: 12, sm: 6, md: 9 }}
                        mb="sm"
                        data-testid="skeleton"
                    >
                        <Flex m={0} p={0} gap="sm" w="100%">
                            <SummarySkeletonCard />
                            <SummarySkeletonCard />
                            <SummarySkeletonCard />
                        </Flex>
                    </Grid.Col>
                )}

                {!isAppConnected && (
                    <Flex justify="center" w="100%" mb="1.5rem">
                        <Button
                            variant="light"
                            radius="md"
                            tt="uppercase"
                            mx={6}
                            fullWidth={isSmallDevice}
                            data-testid="add-connection"
                            onClick={() =>
                                showConnectionModal(appAddress as Address)
                            }
                        >
                            Add connection
                        </Button>
                    </Flex>
                )}

                <Card w="100%" h="100%" mt="md" mx={6}>
                    <Group gap={5} align="center">
                        <TbInbox size={20} />
                        <Text c="dimmed" lh={1}>
                            Latest inputs
                        </Text>
                    </Group>

                    <Group gap={5} style={{ overflowX: "auto" }}>
                        <LatestInputsTable
                            inputs={inputs}
                            fetching={fetching}
                            totalCount={inputsTotalCount}
                        />
                    </Group>

                    {inputsTotalCount > 0 && (
                        <Group gap={5} mt="auto">
                            <Button
                                component={Link}
                                href={`/applications/${appAddress}/${appVersion}/inputs`}
                                variant="light"
                                fullWidth={isSmallDevice}
                                mt="md"
                                mx="auto"
                                radius="md"
                                tt="uppercase"
                            >
                                View inputs
                            </Button>
                        </Group>
                    )}
                </Card>
            </Grid>
        </Stack>
    );
};

export default ApplicationSummary;
