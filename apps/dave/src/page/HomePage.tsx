import type { Application, Pagination } from "@cartesi/viem";
import { Card, Center, Stack, Text } from "@mantine/core";
import { type FC } from "react";
import { TbCpu } from "react-icons/tb";
import { ApplicationList } from "../components/application/ApplicationList";
import PageTitle from "../components/layout/PageTitle";
import { NextPagination } from "../components/navigation/NextPagination";

type Props = {
    applications: Application[];
    pagination?: Pagination;
};

const NoApplications = () => (
    <Card shadow="md">
        <Center>
            <Text c="dimmed" size="xl">
                no applications deployed
            </Text>
        </Center>
    </Card>
);

export const HomePage: FC<Props> = (props) => {
    const { applications, pagination } = props;

    return (
        <Stack>
            <PageTitle Icon={TbCpu} title="Applications" />
            {applications.length > 0 && (
                <ApplicationList applications={applications} />
            )}
            {applications.length === 0 && <NoApplications />}
            {pagination && <NextPagination pagination={pagination} />}
        </Stack>
    );
};
