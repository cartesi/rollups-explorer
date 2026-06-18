import type { Application, ApplicationStatus } from "@cartesi/viem";
import {
    Alert,
    Badge,
    Card,
    Group,
    Spoiler,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { isNotNil } from "ramda";
import { Activity, type FC } from "react";
import { TbInfoCircle } from "react-icons/tb";
import useRightColorShade from "../../hooks/useRightColorShade";
import { pathBuilder } from "../../routes/routePathBuilder";
import { useSelectedNodeConnection } from "../connection/hooks";
import SendMenu from "../send/SendMenu";
import { isForeclosed } from "./utils";

type ApplicationCardProps = { application: Application };

const getStateColour = (state: ApplicationStatus) => {
    switch (state) {
        case "OK":
            return "green";
        case "FAILED":
            return "red";
        case "DIVERGED":
        case "CORRUPTED":
            return "gray";
        default:
            return "orange";
    }
};

export const ApplicationCard: FC<ApplicationCardProps> = ({ application }) => {
    const {
        applicationAddress,
        consensusType,
        name,
        processedInputs,
        status,
        reason,
        enabled,
    } = application;
    const stateColour = useRightColorShade(getStateColour(status));
    const theme = useMantineTheme();
    const selectedConnection = useSelectedNodeConnection();
    const url = pathBuilder.application({ application: application.name });
    const isAppForeclosed = isForeclosed(application);
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
                        <Text
                            c="dimmed"
                            size="xs"
                            style={{ wordBreak: "break-all" }}
                        >
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
