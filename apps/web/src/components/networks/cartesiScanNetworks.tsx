"use client";
import {
    Divider,
    Group,
    Indicator,
    Menu,
    Text,
    Tooltip,
    UnstyledButton,
    useMantineTheme,
    VisuallyHidden,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FC } from "react";
import { TbCaretUpFilled, TbExternalLink } from "react-icons/tb";
import {
    anvil,
    arbitrum,
    arbitrumSepolia,
    base,
    baseSepolia,
    mainnet,
    optimism,
    optimismSepolia,
    sepolia,
} from "viem/chains";
import { useConfig } from "wagmi";
import ArbitrumIcon from "../icons/Arbitrum";
import BaseIcon from "../icons/Base";
import EthereumIcon from "../icons/Ethereum";
import HardhatIcon from "../icons/Hardhat";
import OptimismIcon from "../icons/Optimism";

const chainIds = [
    mainnet.id,
    sepolia.id,
    optimism.id,
    optimismSepolia.id,
    base.id,
    baseSepolia.id,
    anvil.id,
    arbitrum.id,
    arbitrumSepolia.id,
] as const;

type IconType = typeof EthereumIcon;
type SupportedChains = (typeof chainIds)[number];

interface NetworkGroupProps extends NetworkGroup {
    currentChain: number;
}

interface NetworkGroup {
    Icon: IconType;
    text: string;
    externalLink: string;
    chainId: SupportedChains;
}

const mainnets: NetworkGroup[] = [
    {
        Icon: EthereumIcon,
        text: mainnet.name,
        chainId: mainnet.id,
        externalLink: "https://cartesiscan.io",
    },

    {
        Icon: OptimismIcon,
        text: optimism.name,
        chainId: optimism.id,
        externalLink: "https://optimism.cartesiscan.io",
    },
    {
        Icon: BaseIcon,
        text: base.name,
        chainId: base.id,
        externalLink: "https://base.cartesiscan.io",
    },
    {
        Icon: ArbitrumIcon,
        text: arbitrum.name,
        chainId: arbitrum.id,
        externalLink: "https://arbitrum.cartesiscan.io",
    },
];

const testnets: NetworkGroup[] = [
    {
        Icon: EthereumIcon,
        text: sepolia.name,
        chainId: sepolia.id,
        externalLink: "https://sepolia.cartesiscan.io",
    },
    {
        Icon: OptimismIcon,
        text: optimismSepolia.name,
        chainId: optimismSepolia.id,
        externalLink: "https://optimism-sepolia.cartesiscan.io",
    },

    {
        Icon: BaseIcon,
        text: baseSepolia.name,
        chainId: baseSepolia.id,
        externalLink: "https://base-sepolia.cartesiscan.io",
    },
    {
        Icon: ArbitrumIcon,
        text: arbitrumSepolia.name,
        chainId: arbitrumSepolia.id,
        externalLink: "https://arbitrum-sepolia.cartesiscan.io",
    },
];

const NetworkGroup: FC<NetworkGroupProps> = ({
    Icon,
    externalLink,
    text,
    chainId,
    currentChain,
}) => {
    const theme = useMantineTheme();
    const disabled = currentChain === chainId;
    const { chainIconSize } = theme.other;

    return (
        <Menu.Item
            component="a"
            target="_blank"
            href={externalLink}
            disabled={disabled}
        >
            <Tooltip label={externalLink}>
                <Indicator autoContrast disabled={!disabled} processing>
                    <Group justify="space-between" wrap="nowrap">
                        <Group justify="flex-start">
                            <Icon size={chainIconSize} />
                            <Text>{text}</Text>
                        </Group>
                        <TbExternalLink />
                    </Group>
                </Indicator>
            </Tooltip>
        </Menu.Item>
    );
};

const CaretIcon: FC<{ up: boolean }> = ({ up }) => {
    const theme = useMantineTheme();
    const styles = {
        transform: `rotateZ(${up ? 0 : 180}deg)`,
        transitionTimingFunction: "ease-in-out",
        transitionDuration: "300ms",
        transitionProperty: "all",
    };

    return (
        <TbCaretUpFilled
            style={styles}
            size={18}
            color={theme.colors.cyan[5]}
        />
    );
};

const allNetworks = [...mainnets, ...testnets];

const getIconByChainId = (id: number) => {
    const network = allNetworks.find((network) => network.chainId === id);
    if (network) return network.Icon;

    return HardhatIcon;
};

const MainIcon: FC<{ chainId: number }> = ({ chainId }) => {
    const Icon = getIconByChainId(chainId);
    return <Icon size={28} id={`chain-${chainId}-icon`} />;
};

interface CartesiScanChainsProps {
    onOpen: () => void;
}

export const CartesiScanChains: FC<CartesiScanChainsProps> = ({ onOpen }) => {
    const [isOpen, { close, open }] = useDisclosure(false);
    const config = useConfig();
    const chain = config.chains[0];
    const chainName = chain.name;

    return (
        <Menu
            id="cartesiscan-chain-menu"
            withArrow
            withinPortal={false}
            zIndex={120}
            offset={9}
            arrowSize={12}
            shadow="xl"
            onClose={close}
            onOpen={() => {
                open();
                onOpen();
            }}
        >
            <Menu.Target>
                <UnstyledButton variant="transparent" p={0}>
                    <Group gap={3}>
                        <VisuallyHidden>{chainName}</VisuallyHidden>
                        <MainIcon chainId={chain.id} />
                        <CaretIcon up={isOpen} />
                    </Group>
                </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>
                    <Divider label="Mainnets" labelPosition="center" />
                </Menu.Label>
                {mainnets.map((item) => (
                    <NetworkGroup
                        key={item.chainId}
                        chainId={item.chainId}
                        Icon={item.Icon}
                        externalLink={item.externalLink}
                        text={item.text}
                        currentChain={chain.id}
                    />
                ))}

                <Menu.Label>
                    <Divider label="Testnets" labelPosition="center" />
                </Menu.Label>
                {testnets.map((item) => (
                    <NetworkGroup
                        key={item.chainId}
                        Icon={item.Icon}
                        chainId={item.chainId}
                        externalLink={item.externalLink}
                        text={item.text}
                        currentChain={chain.id}
                    />
                ))}
            </Menu.Dropdown>
        </Menu>
    );
};
