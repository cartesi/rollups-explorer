"use client";
import {
    AppShell,
    Burger,
    Button,
    Group,
    Modal,
    NavLink,
    Switch,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ReactNode, FC } from "react";
import CartesiLogo from "../components/cartesiLogo";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TbHome, TbMoonStars, TbPigMoney, TbSun } from "react-icons/tb";
import Link from "next/link";
import { ERC20DepositForm } from "@cartesi/rollups-explorer-ui";
import { useAccount } from "wagmi";
import useApplications from "../hooks/useApplications";

const Shell: FC<{ children: ReactNode }> = ({ children }) => {
    const [opened, { toggle }] = useDisclosure();
    const [deposit, { open: openDeposit, close: closeDeposit }] =
        useDisclosure(false);
    const theme = useMantineTheme();
    const { isConnected } = useAccount();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [{ data }] = useApplications();
    const applications = (data?.applications ?? []).map((a) => a.id);

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: {
                    desktop: true,
                    mobile: !opened,
                },
            }}
            padding="md"
        >
            <Modal opened={deposit} onClose={closeDeposit} title="Deposit">
                <ERC20DepositForm applications={applications} />
            </Modal>
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="sm"
                    />
                    <Group justify="space-between" style={{ flex: 1 }}>
                        <CartesiLogo height={40} />
                        <Group ml="xl" gap="md" visibleFrom="sm">
                            <Link href="/">
                                <Button
                                    variant="subtle"
                                    leftSection={<TbHome />}
                                >
                                    Home
                                </Button>
                            </Link>
                            <Button
                                variant="subtle"
                                leftSection={<TbPigMoney />}
                                onClick={openDeposit}
                                disabled={!isConnected}
                            >
                                Deposit
                            </Button>
                            <ConnectButton />
                            <Switch
                                checked={colorScheme === "dark"}
                                onChange={() => toggleColorScheme()}
                                size="md"
                                onLabel={
                                    <TbSun color={theme.white} size="1rem" />
                                }
                                offLabel={
                                    <TbMoonStars
                                        color={theme.colors.gray[6]}
                                        size="1rem"
                                    />
                                }
                            />
                        </Group>
                    </Group>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar py="md" px={4}>
                <NavLink label="Home" href="/" leftSection={<TbHome />} />
                <NavLink
                    disabled
                    label="Deposit"
                    href="/deposit"
                    leftSection={<TbPigMoney />}
                />
            </AppShell.Navbar>
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
};
export default Shell;
