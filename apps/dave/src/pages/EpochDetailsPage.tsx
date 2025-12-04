import type { Epoch, Input } from "@cartesi/viem";
import {
    Anchor,
    Badge,
    Group,
    Stack,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import type { FC } from "react";
import { TbClockFilled, TbInbox, TbTrophy } from "react-icons/tb";
import { Link, useParams } from "react-router";
import { CycleRangeFormatted } from "../components/CycleRangeFormatted";
import { useEpochStatusColor } from "../components/epoch/useEpochStatusColor";
import { InputList } from "../components/input/InputList";
import PageTitle from "../components/layout/PageTitle";
import { routePathBuilder, type EpochParams } from "../routes/routePathBuilder";

type Props = {
    epoch: Epoch;
    inputs: Input[];
};

export const EpochDetailsPage: FC<Props> = ({ epoch, inputs }) => {
    const theme = useMantineTheme();
    const epochStatusColor = useEpochStatusColor(epoch);
    const params = useParams<EpochParams>();
    const tournamentAddress = epoch.tournamentAddress;
    const tournamentUrl = tournamentAddress
        ? routePathBuilder.tournament({
              application: params.application ?? "",
              epochIndex: epoch.index.toString(),
              tournamentAddress: tournamentAddress,
          })
        : undefined;
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

            {tournamentUrl && (
                <Anchor
                    component={Link}
                    to={tournamentUrl}
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
            )}

            <Group gap="xs">
                <TbInbox size={theme.other.mdIconSize} />
                <Title order={3}>Inputs</Title>
            </Group>
            <InputList inputs={inputs} />
        </Stack>
    );
};
