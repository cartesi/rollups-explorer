import type {
    Application,
    Epoch,
    Input,
    Pagination,
    Tournament,
} from "@cartesi/client";
import {
    Anchor,
    Badge,
    Card,
    Center,
    Group,
    Stack,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { isEmpty, isNotNil } from "ramda";
import { Activity, type FC } from "react";
import { TbClockFilled, TbInbox, TbTrophy } from "react-icons/tb";
import { isAddress } from "viem";
import { CycleRangeFormatted } from "../components/CycleRangeFormatted";
import { useEpochStatusColor } from "../components/epoch/useEpochStatusColor";
import { InputList } from "../components/input/InputList";
import PageTitle from "../components/layout/PageTitle";
import { NextPagination } from "../components/navigation/NextPagination";
import { getTournamentCycleRange } from "../lib/prtUtils";

type Props = {
    application: Application;
    epoch: Epoch;
    inputs: Input[];
    pagination?: Pagination;
    tournament?: Tournament;
};

const NoInputs = () => (
    <Card shadow="md">
        <Center>
            <Text c="dimmed" size="xl" tt="uppercase">
                no inputs.
            </Text>
        </Center>
    </Card>
);

export const EpochPage: FC<Props> = ({
    epoch,
    inputs,
    pagination,
    application,
    tournament,
}) => {
    const theme = useMantineTheme();
    const epochStatusColor = useEpochStatusColor(epoch);
    const tournamentAddress = epoch.tournamentAddress;
    const tournamentUrl = isAddress(tournamentAddress ?? "0x")
        ? `${epoch.index}/tournaments/${tournamentAddress}`
        : null;
    const inDispute = tournament?.snapshot.standing === "MATCHES_ACTIVE";
    const tournamentColor = inDispute ? epochStatusColor : "";

    return (
        <Stack>
            <PageTitle Icon={TbClockFilled} title="Epoch" />
            <Group>
                <Text>Status</Text>
                <Badge color={epochStatusColor}>{epoch.status}</Badge>
                {inDispute && (
                    <Badge variant="outline" color={epochStatusColor}>
                        disputed
                    </Badge>
                )}
            </Group>

            <Activity
                mode={
                    application.consensusType === "PRT" ? "visible" : "hidden"
                }
            >
                {isNotNil(tournamentUrl) ? (
                    <Anchor
                        component={Link}
                        href={tournamentUrl!}
                        variant="text"
                        c={tournamentColor}
                    >
                        <Group gap="xs">
                            <Group gap="sm">
                                <TbTrophy
                                    size={theme.other.mdIconSize}
                                    color={tournamentColor}
                                />
                                <Text c={tournamentColor}>Tournament</Text>
                            </Group>
                            {tournament && (
                                <CycleRangeFormatted
                                    size="md"
                                    range={getTournamentCycleRange(tournament)}
                                />
                            )}
                        </Group>
                    </Anchor>
                ) : (
                    <Group gap="sm">
                        <TbTrophy size={theme.other.mdIconSize} />
                        <Text>No Tournament Yet</Text>
                    </Group>
                )}
            </Activity>

            <Group gap="xs">
                <TbInbox size={theme.other.mdIconSize} />
                <Title order={3}>Inputs</Title>
            </Group>
            {inputs.length > 0 && <InputList inputs={inputs} />}
            {isEmpty(inputs) && <NoInputs />}
            {pagination && <NextPagination pagination={pagination} />}
        </Stack>
    );
};
