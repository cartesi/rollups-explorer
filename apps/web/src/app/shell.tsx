"use client";
import {
    ERC20DepositForm,
    EtherDepositForm,
} from "@cartesi/rollups-explorer-ui";
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
import { FC, ReactNode } from "react";
import CartesiLogo from "../components/cartesiLogo";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import {
    TbApps,
    TbDotsVertical,
    TbHome,
    TbMoonStars,
    TbPigMoney,
    TbSun,
} from "react-icons/tb";
import { useAccount } from "wagmi";
import ConnectionView from "../components/connectionView";
import { useApplicationsQuery, useTokensQuery } from "../graphql";

const Shell: FC<{ children: ReactNode }> = ({ children }) => {
    const [opened, { toggle }] = useDisclosure();
    const [menuOpened, { toggle: toggleMenu }] = useDisclosure(false);
    const [deposit, { open: openDeposit, close: closeDeposit }] =
        useDisclosure(false);
    const [etherDeposit, { open: openEtherDeposit, close: closeEtherDeposit }] =
        useDisclosure(false);
    const theme = useMantineTheme();
    const { isConnected } = useAccount();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [{ data: applicationData }] = useApplicationsQuery({
        variables: {
            limit: 1000,
        },
    });
    const applications = (applicationData?.applications ?? []).map((a) => a.id);
    const [{ data: tokenData }] = useTokensQuery({
        variables: {
            limit: 1000,
        },
    });
    const tokens = (tokenData?.tokens ?? []).map(
        (a) => `${a.symbol} - ${a.name} - ${a.id}`,
    );

    const themeDefaultProps = theme.components?.AppShell?.defaultProps ?? {};

    return (
        <AppShell
            header={themeDefaultProps.header}
            navbar={{
                ...themeDefaultProps?.navbar,
                collapsed: {
                    desktop: true,
                    mobile: !opened,
                },
            }}
            aside={{
                ...themeDefaultProps?.aside,
                collapsed: {
                    desktop: !menuOpened,
                    mobile: !menuOpened,
                },
            }}
            padding="md"
        >
            <Modal opened={deposit} onClose={closeDeposit} title="Deposit">
                <ERC20DepositForm applications={applications} tokens={tokens} />
            </Modal>
            <Modal
                opened={etherDeposit}
                onClose={closeEtherDeposit}
                title="Deposit Ether"
            >
                <EtherDepositForm applications={applications} />
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
                            <Link href="/applications">
                                <Button
                                    variant="subtle"
                                    leftSection={<TbApps />}
                                >
                                    Applications
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
                            <Button
                                variant="subtle"
                                leftSection={<TbPigMoney />}
                                onClick={openEtherDeposit}
                                disabled={!isConnected}
                            >
                                Deposit Ether
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
                    <Button variant="subtle" onClick={toggleMenu}>
                        <TbDotsVertical size={theme.other.iconSize} />
                    </Button>
                </Group>
            </AppShell.Header>
            <AppShell.Aside p="md">
                <ConnectionView />
            </AppShell.Aside>
            <AppShell.Navbar py="md" px={4}>
                <NavLink label="Home" href="/" leftSection={<TbHome />} />
                <NavLink
                    disabled
                    label="Deposit"
                    href="/deposit"
                    leftSection={<TbPigMoney />}
                />
                <ConnectButton />
            </AppShell.Navbar>
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
};
export default Shell;
