import type { Epoch, Pagination } from "@cartesi/viem";
import { Card, Center, Stack, Text } from "@mantine/core";
import { type FC } from "react";
import { TbClockFilled } from "react-icons/tb";
import { EpochList } from "../components/epoch/EpochList";
import PageTitle from "../components/layout/PageTitle";
import { NextPagination } from "../components/navigation/NextPagination";

type Props = {
    epochs: Epoch[];
    pagination?: Pagination;
};

const NoEpochs: FC = () => (
    <Card shadow="md">
        <Center>
            <Text c="dimmed">no epochs found</Text>
        </Center>
    </Card>
);

export const EpochsPage: FC<Props> = ({ epochs, pagination }) => {
    return (
        <Stack>
            <PageTitle Icon={TbClockFilled} title={`Epochs`} />
            {epochs.length > 0 && <EpochList epochs={epochs} />}
            {epochs.length === 0 && <NoEpochs />}
            {pagination && <NextPagination pagination={pagination} />}
        </Stack>
    );
};
