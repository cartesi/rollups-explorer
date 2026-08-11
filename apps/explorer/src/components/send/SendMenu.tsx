"use client";
import type { Application } from "@cartesi/client";
import {
    Button,
    Group,
    Menu,
    Text,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { cond, filter, isNil, isNotNil } from "ramda";
import { useState, type FC, type ReactNode } from "react";
import {
    TbCoins,
    TbCurrencyEthereum,
    TbInbox,
    TbLockFilled,
    TbSend,
} from "react-icons/tb";
import { useAccount } from "wagmi";
import { content } from "../../content";
import { isForeclosed, isGuardian } from "../application/utils";
import { ConfirmationModal } from "../ConfirmationModal";
import { useSelectedNodeConnection } from "../connection/hooks";
import { useSpecification } from "../specification/hooks/useSpecification";
import type { DbSpecification } from "../specification/types";
import { useSendAction } from "./hooks";

type SendMenuProps = { application: Application };

const jsonAbiOnly = (spec: DbSpecification) => spec.mode === "json_abi";

const getMenuState = cond([
    [
        isForeclosed,
        () => ({
            tooltip: content.foreclose.sendTooltip,
            disabled: true,
        }),
    ],
    [() => true, () => ({ tooltip: "", disabled: false })],
]);

const SendMenu: FC<SendMenuProps> = ({ application }) => {
    const selectedConnection = useSelectedNodeConnection();
    const { listSpecifications } = useSpecification();
    const [opened, handlers] = useDisclosure(false);
    const theme = useMantineTheme();
    const [openedTooltip, tooltipHandlers] = useDisclosure(false);
    const [confirmationState, setConfirmationState] = useState<null | {
        action: () => void;
        title?: string;
        text: ReactNode;
    }>(null);
    const actions = useSendAction();
    const account = useAccount();
    const connectModal = useConnectModal();
    const chainModal = useChainModal();
    const needSwitchNetwork = account.isConnected && isNil(account.chain);
    const canSend = !needSwitchNetwork && account.isConnected;
    const menuState = getMenuState(application);
    const isAppGuardian = isGuardian(application, account.address);

    if (selectedConnection?.type === "system_mock") return null;

    return (
        <Menu
            disabled={menuState.disabled}
            opened={opened}
            onClose={handlers.close}
            onDismiss={handlers.close}
        >
            <ConfirmationModal
                isOpened={isNotNil(confirmationState)}
                title={confirmationState?.title}
                text={confirmationState?.text ?? ""}
                onClose={() => {
                    setConfirmationState(null);
                }}
                onConfirm={() => {
                    confirmationState?.action();
                    setConfirmationState(null);
                }}
            />

            <Menu.Target>
                <Tooltip
                    label={menuState.tooltip}
                    disabled={!menuState.disabled}
                    opened={openedTooltip}
                >
                    <Button
                        aria-disabled={menuState.disabled}
                        variant="light"
                        onClick={(evt) => {
                            evt.stopPropagation();
                            evt.preventDefault();

                            if (isForeclosed(application)) {
                                tooltipHandlers.toggle();
                                return;
                            }

                            if (needSwitchNetwork)
                                return chainModal.openChainModal?.();

                            if (canSend) {
                                handlers.toggle();
                            } else {
                                connectModal.openConnectModal?.();
                            }
                        }}
                        rightSection={<TbSend size={18} />}
                    >
                        Send
                    </Button>
                </Tooltip>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<TbInbox size={theme.other.mdIconSize} />}
                    onClick={(evt) => {
                        evt.stopPropagation();
                        const specifications = filter(
                            jsonAbiOnly,
                            listSpecifications() ?? [],
                        );
                        actions.sendGenericInput(application, specifications);
                        handlers.close();
                    }}
                >
                    <Text fw="500">Input</Text>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Label>
                    <Group gap={3}>
                        <TbCoins size={theme.other.smIconSize} />
                        <Text>Deposits</Text>
                    </Group>
                </Menu.Label>
                <Menu.Item
                    leftSection={
                        <TbCurrencyEthereum size={theme.other.mdIconSize} />
                    }
                    onClick={(evt) => {
                        evt.stopPropagation();
                        actions.depositEth(application);
                        handlers.close();
                    }}
                >
                    <Text fw="500">Ether</Text>
                </Menu.Item>
                <Menu.Item
                    leftSection={
                        <TbCurrencyEthereum size={theme.other.mdIconSize} />
                    }
                    onClick={(evt) => {
                        evt.stopPropagation();
                        actions.depositErc20(application);
                        handlers.close();
                    }}
                >
                    <Text fw="500">ERC-20</Text>
                </Menu.Item>
                <Menu.Item
                    leftSection={
                        <TbCurrencyEthereum size={theme.other.mdIconSize} />
                    }
                    onClick={(evt) => {
                        evt.stopPropagation();
                        actions.depositErc721(application);
                        handlers.close();
                    }}
                >
                    <Text fw="500">ERC-721</Text>
                </Menu.Item>
                <Menu.Item
                    leftSection={
                        <TbCurrencyEthereum size={theme.other.mdIconSize} />
                    }
                    onClick={(evt) => {
                        evt.stopPropagation();
                        actions.depositErc1155Single(application);
                        handlers.close();
                    }}
                >
                    <Text fw="500">ERC-1155 (Single)</Text>
                </Menu.Item>
                <Menu.Item
                    leftSection={
                        <TbCurrencyEthereum size={theme.other.mdIconSize} />
                    }
                    onClick={(evt) => {
                        evt.stopPropagation();
                        actions.depositErc1155Batch(application);
                        handlers.close();
                    }}
                >
                    <Text fw="500">ERC-1155 (Batch)</Text>
                </Menu.Item>

                {isAppGuardian ? (
                    <>
                        <Menu.Divider />
                        <Menu.Item
                            leftSection={
                                <TbLockFilled size={theme.other.mdIconSize} />
                            }
                            color="red"
                            onClick={(evt) => {
                                evt.stopPropagation();
                                setConfirmationState({
                                    title: content.foreclose.confirmation.title,
                                    text: content.foreclose.confirmation
                                        .description,
                                    action: () => {
                                        actions.foreclose(application);
                                    },
                                });
                                handlers.close();
                            }}
                        >
                            <Text fw="500">
                                {content.foreclose.forecloseTxt}
                            </Text>
                        </Menu.Item>
                    </>
                ) : null}
            </Menu.Dropdown>
        </Menu>
    );
};

export default SendMenu;
