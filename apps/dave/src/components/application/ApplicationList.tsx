import type { Application } from "@cartesi/viem";
import { Stack } from "@mantine/core";
import type { FC } from "react";
import { ApplicationCard } from "./ApplicationCard";

type Props = { applications: Application[] };

export const ApplicationList: FC<Props> = ({ applications }) => {
    return (
        <Stack gap={5}>
            {applications.map((app) => (
                <ApplicationCard
                    key={app.applicationAddress}
                    application={app}
                />
            ))}
        </Stack>
    );
};
