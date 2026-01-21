"use client";
import type { Application } from "@cartesi/viem";
import { Button, Group, Menu, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { FC } from "react";
import { TbCoins, TbCurrencyEthereum, TbInbox, TbSend } from "react-icons/tb";
import { useAccount } from "wagmi";
import { useAppConfig } from "../../providers/AppConfigProvider";
import { useSendAction } from "./hooks";

type SendMenuProps = { application: Application };

const SendMenu: FC<SendMenuProps> = ({ application }) => {
    const appConfig = useAppConfig();
    const [opened, handlers] = useDisclosure(false);
    const actions = useSendAction();
    const account = useAccount();
    const connectModal = useConnectModal();

    if (appConfig.isMockEnabled) return null;

    return (
        <Menu
            opened={opened}
            onClose={handlers.close}
            onDismiss={handlers.close}
        >
            <Menu.Target>
                <Button
                    variant="light"
                    onClick={(evt) => {
                        evt.stopPropagation();
                        evt.preventDefault();
                        if (account.isConnected) {
                            handlers.toggle();
                        } else {
                            connectModal.openConnectModal?.();
                        }
                    }}
                    rightSection={<TbSend size={18} />}
                >
                    Send
                </Button>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<TbInbox size={24} />}
                    onClick={(evt) => {
                        evt.stopPropagation();
                        actions.sendGenericInput(application);
                        handlers.close();
                    }}
                >
                    <Text fw="500">Input</Text>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Label>
                    <Group gap={3}>
                        <TbCoins size={21} />
                        <Text>Deposits</Text>
                    </Group>
                </Menu.Label>
                <Menu.Item
                    leftSection={<TbCurrencyEthereum size={24} />}
                    onClick={(evt) => {
                        evt.stopPropagation();
                        actions.depositEth(application);
                        handlers.close();
                    }}
                >
                    <Text fw="500">Ethereum</Text>
                </Menu.Item>
                <Menu.Item
                    leftSection={<TbCurrencyEthereum size={24} />}
                    onClick={(evt) => {
                        evt.stopPropagation();
                        actions.depositErc20(application);
                        handlers.close();
                    }}
                >
                    <Text fw="500">ERC-20</Text>
                </Menu.Item>
                <Menu.Item
                    leftSection={<TbCurrencyEthereum size={24} />}
                    onClick={(evt) => {
                        evt.stopPropagation();
                        actions.depositErc721(application);
                        handlers.close();
                    }}
                >
                    <Text fw="500">ERC-721</Text>
                </Menu.Item>
                <Menu.Item
                    leftSection={<TbCurrencyEthereum size={24} />}
                    onClick={(evt) => {
                        evt.stopPropagation();
                        actions.depositErc1155Single(application);
                        handlers.close();
                    }}
                >
                    <Text fw="500">ERC-1155 (Single)</Text>
                </Menu.Item>
                <Menu.Item
                    leftSection={<TbCurrencyEthereum size={24} />}
                    onClick={(evt) => {
                        evt.stopPropagation();
                        actions.depositErc1155Batch(application);
                        handlers.close();
                    }}
                >
                    <Text fw="500">ERC-1155 (Batch)</Text>
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

export default SendMenu;
