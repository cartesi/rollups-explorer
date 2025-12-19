import type { Epoch, Input, Pagination } from "@cartesi/viem";
import {
    Anchor,
    Badge,
    Group,
    Stack,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import type { FC } from "react";
import { TbClockFilled, TbInbox, TbTrophy } from "react-icons/tb";
import { isAddress } from "viem";
import { CycleRangeFormatted } from "../components/CycleRangeFormatted";
import { useEpochStatusColor } from "../components/epoch/useEpochStatusColor";
import { InputList } from "../components/input/InputList";
import PageTitle from "../components/layout/PageTitle";
import { NextPagination } from "../components/navigation/NextPagination";

type Props = {
    epoch: Epoch;
    inputs: Input[];
    pagination?: Pagination;
};

export const EpochPage: FC<Props> = ({ epoch, inputs, pagination }) => {
    const theme = useMantineTheme();
    const epochStatusColor = useEpochStatusColor(epoch);
    const tournamentAddress = epoch.tournamentAddress;
    const tournamentUrl = isAddress(tournamentAddress ?? "0x")
        ? `${epoch.index}/tournaments/${tournamentAddress}`
        : null;
    const inDispute = false; // XXX: how to know if an epoch is in dispute?
    const tournamentColor = inDispute ? epochStatusColor : "";
    const startCycle = 0; // XXX: how to know the startCycle?
    const endCycle = 0; // XXX: how to know the endCycle?

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

            <Activity mode={isNotNil(tournamentUrl) ? "visible" : "hidden"}>
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
                        <CycleRangeFormatted
                            size="md"
                            range={[startCycle, endCycle]}
                        />
                    </Group>
                </Anchor>
            </Activity>

            <Activity mode={isNil(tournamentUrl) ? "visible" : "hidden"}>
                <Group gap="sm">
                    <TbTrophy size={theme.other.mdIconSize} />
                    <Text>No Tournament Yet</Text>
                </Group>
            </Activity>

            <Group gap="xs">
                <TbInbox size={theme.other.mdIconSize} />
                <Title order={3}>Inputs</Title>
            </Group>
            <InputList inputs={inputs} />
            {pagination && <NextPagination pagination={pagination} />}
        </Stack>
    );
};
