import type { Application } from "@cartesi/client";
import { Alert, Card, Group, useMantineTheme } from "@mantine/core";
import type { FC } from "react";
import {
    TbExclamationCircleFilled,
    TbInfoCircleFilled,
    TbReceipt,
} from "react-icons/tb";
import { content } from "../../content";
import TransactionHash from "../TransactionHash";
import { isAccountsDriveProved } from "./utils";

type ApplicationForecloseStatusProps = {
    application: Application;
};

export const ApplicationForecloseStatus: FC<
    ApplicationForecloseStatusProps
> = ({ application }) => {
    const theme = useMantineTheme();
    const accountsDriveProved = isAccountsDriveProved(application);

    return (
        <Card padding={0}>
            <Card.Section withBorder>
                <Alert
                    icon={<TbInfoCircleFilled size={theme.other.mdIconSize} />}
                    color="info"
                >
                    {content.foreclose.application.isForeclosed}
                </Alert>
            </Card.Section>
            <Alert
                icon={
                    !accountsDriveProved ? (
                        <TbExclamationCircleFilled
                            size={theme.other.mdIconSize}
                        />
                    ) : (
                        <TbInfoCircleFilled size={theme.other.mdIconSize} />
                    )
                }
                color={accountsDriveProved ? "info" : "warning"}
            >
                {accountsDriveProved
                    ? content.withdrawal.accountsDrive.proved
                    : content.withdrawal.accountsDrive.notProved}
            </Alert>
            {accountsDriveProved && (
                <Card.Section withBorder px="md" py="sm">
                    <Group gap="sm">
                        <TbReceipt size={theme.other.mdIconSize} />
                        <TransactionHash
                            transactionHash={
                                application.accountsDriveProvedTransaction
                            }
                        />
                    </Group>
                </Card.Section>
            )}
        </Card>
    );
};
