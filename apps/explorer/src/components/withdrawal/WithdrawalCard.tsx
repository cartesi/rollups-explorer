import type { Withdrawal } from "@cartesi/client";
import {
    Card,
    Group,
    Stack,
    Text,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { type FC } from "react";
import { TbReceipt, TbUserFilled } from "react-icons/tb";
import { content } from "../../content";
import TransactionHash from "../TransactionHash";
import { WithdrawalView } from "./WithdrawalView";

interface Props {
    withdrawal: Withdrawal;
}

export const WithdrawalCard: FC<Props> = ({ withdrawal }) => {
    const theme = useMantineTheme();
    return (
        <Card>
            <Card.Section withBorder inheritPadding py="sm">
                <Group justify="flex-end">
                    <Tooltip label={content.withdrawal.accountIndex}>
                        <Group gap={3} align="flex-start">
                            <TbUserFilled size={theme.other.mdIconSize} />

                            <Text fw="bold"># {withdrawal.accountIndex}</Text>
                        </Group>
                    </Tooltip>
                </Group>
            </Card.Section>

            <Stack py="sm" gap="xs">
                <WithdrawalView withdrawal={withdrawal} />
            </Stack>

            <Card.Section inheritPadding withBorder py="sm">
                <Group gap={3}>
                    <Tooltip label={content.withdrawal.txHash}>
                        <TbReceipt size={theme.other.mdIconSize} />
                    </Tooltip>
                    <TransactionHash
                        transactionHash={withdrawal.transactionHash}
                    />
                </Group>
            </Card.Section>
        </Card>
    );
};
