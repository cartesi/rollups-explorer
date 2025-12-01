import type { Epoch } from "@cartesi/viem";
import { Group, Stack, Text } from "@mantine/core";
import { type FC } from "react";
import { TbClockFilled } from "react-icons/tb";
import type { Address } from "viem";
import { EpochList } from "../components/epoch/EpochList";
import PageTitle from "../components/layout/PageTitle";
import { NotFound } from "../components/navigation/NotFound";

type Props = {
    application: string | Address;
    epochs: Epoch[];
};

const NoEpochs: FC<{ application: string | Address }> = ({ application }) => (
    <NotFound>
        <Group gap={2}>
            <Text c="dimmed">No Epochs found for application</Text>
            <Text c="cyan" fw="bold">
                {application}
            </Text>
        </Group>
    </NotFound>
);

export const EpochsPage: FC<Props> = ({ application, epochs }) => {
    return (
        <Stack>
            <PageTitle Icon={TbClockFilled} title={`Epochs`} />
            {epochs?.length > 0 ? (
                <EpochList epochs={epochs} />
            ) : (
                <NoEpochs application={application} />
            )}
        </Stack>
    );
};
