"use client";
import {
    Avatar,
    Badge,
    Button,
    Group,
    Text,
    useMantineTheme,
    type ButtonProps,
    type MantineSize,
} from "@mantine/core";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Activity, useState, type FC } from "react";
import { TbCaretDownFilled } from "react-icons/tb";
import { type Hex } from "viem";
import { HashAvatar } from "./HashAvatar";

type Size = number | MantineSize | string;

interface ConnectWalletProps {
    showChain?: boolean;
    showBalance?: boolean;
    size?: ButtonProps["size"];
}

const AccountAvatar: FC<{
    address: Hex;
    ensUri?: string;
    size?: Size;
}> = ({ address, ensUri, size }) => {
    const [ensFailed, setEnsFailed] = useState(false);
    if (ensUri && !ensFailed) {
        return (
            <Avatar
                size={size ?? "sm"}
                alt={"Account ENS avatar"}
                src={ensUri}
                onError={() => {
                    setEnsFailed(true);
                }}
            />
        );
    }

    return <HashAvatar hash={address} size={size ?? "sm"} />;
};

export const ConnectWallet: FC<ConnectWalletProps> = ({
    showChain = false,
    showBalance = true,
    size = "sm",
}) => {
    const theme = useMantineTheme();
    return (
        <ConnectButton.Custom key="connect-wallet-button">
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
            }) => {
                const connected = mounted && account && chain;

                if (!connected) {
                    return (
                        <Button onClick={openConnectModal}>
                            <Text fw="bold">Connect Wallet</Text>
                        </Button>
                    );
                }

                if (chain.unsupported) {
                    return (
                        <Button
                            bg="red"
                            onClick={openChainModal}
                            rightSection={
                                <TbCaretDownFilled
                                    size={theme.other.mdIconSize}
                                />
                            }
                        >
                            <Text fw="bold" size="md">
                                Wrong network
                            </Text>
                        </Button>
                    );
                }

                return (
                    <Group gap={3}>
                        <Activity mode={showChain ? "visible" : "hidden"}>
                            <Button
                                variant="outline"
                                onClick={openChainModal}
                                leftSection={
                                    chain.hasIcon &&
                                    chain.iconUrl && (
                                        <Avatar
                                            size="sm"
                                            alt={chain.name ?? "Chain icon"}
                                            src={chain.iconUrl}
                                            color={"transparent"}
                                        />
                                    )
                                }
                            >
                                {chain.name}
                            </Button>
                        </Activity>
                        <Button
                            size={size}
                            variant="outline"
                            onClick={openAccountModal}
                            leftSection={
                                <AccountAvatar
                                    address={account.address as Hex}
                                    ensUri={account.ensAvatar}
                                />
                            }
                            justify="space-between"
                            styles={{
                                section: {
                                    height: "100%",
                                },
                            }}
                            pr={0}
                            rightSection={
                                showBalance && account.displayBalance ? (
                                    <Badge radius={0} h="inherit">
                                        <Text fw="bold" size="sm">
                                            {account.displayBalance}
                                        </Text>
                                    </Badge>
                                ) : (
                                    ""
                                )
                            }
                        >
                            <Text
                                truncate="end"
                                lineClamp={1}
                                maw="7rem"
                                fw="bold"
                            >
                                {account.displayName}
                            </Text>
                        </Button>
                    </Group>
                );
            }}
        </ConnectButton.Custom>
    );
};
