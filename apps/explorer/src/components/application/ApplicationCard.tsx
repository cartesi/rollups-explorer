import type { Application, ApplicationState } from "@cartesi/viem";
import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { Activity, type FC } from "react";
import { pathBuilder } from "../../routes/routePathBuilder";
import { useSelectedNodeConnection } from "../connection/hooks";
import SendMenu from "../send/SendMenu";

type ApplicationCardProps = { application: Application };

const getStateColour = (state: ApplicationState) => {
    switch (state) {
        case "ENABLED":
            return "green";
        case "DISABLED":
            return "red";
        case "INOPERABLE":
            return "gray";
        default:
            return "black";
    }
};

export const ApplicationCard: FC<ApplicationCardProps> = ({ application }) => {
    const { applicationAddress, consensusType, name, processedInputs, state } =
        application;
    const stateColour = getStateColour(state);
    const selectedConnection = useSelectedNodeConnection();
    const url = pathBuilder.application({ application: application.name });
    const inputsLabel =
        processedInputs === 0n
            ? "no inputs"
            : processedInputs === 1n
              ? `${processedInputs} input`
              : `${processedInputs} inputs`;

    return (
        <Card shadow="md" component={Link} href={url}>
            <Stack>
                <Group justify="space-between">
                    <Stack gap="0">
                        <Group justify="space-between">
                            <Text size="xl">{name}</Text>
                        </Group>
                        <Text c="dimmed" size="xs">
                            {applicationAddress}
                        </Text>
                    </Stack>
                    <Activity
                        mode={
                            selectedConnection?.type === "system_mock"
                                ? "hidden"
                                : "visible"
                        }
                    >
                        <SendMenu application={application} />
                    </Activity>
                </Group>
                <Group justify="space-between">
                    <Badge variant="default">{inputsLabel}</Badge>
                    <Group gap="xs">
                        {state !== "ENABLED" && (
                            <Group gap="xs">
                                <Badge color={stateColour}>{state}</Badge>
                            </Group>
                        )}
                        <Badge>{consensusType}</Badge>
                    </Group>
                </Group>
            </Stack>
        </Card>
    );
};
