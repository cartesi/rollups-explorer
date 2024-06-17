"use client";
import {
    BaseCircleColorful,
    EthereumCircleColorful,
    HardhatColorful,
    OptimismCircleColorful,
} from "@ant-design/web3-icons";
import {
    Button,
    Divider,
    Group,
    Indicator,
    Menu,
    Text,
    Tooltip,
    VisuallyHidden,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { T, cond, includes } from "ramda";
import { FC } from "react";
import { TbCaretUpFilled, TbExternalLink } from "react-icons/tb";
import {
    anvil,
    base,
    baseSepolia,
    mainnet,
    optimism,
    optimismSepolia,
    sepolia,
} from "viem/chains";
import { useConfig } from "wagmi";

const chainIds = [
    mainnet.id,
    sepolia.id,
    optimism.id,
    optimismSepolia.id,
    base.id,
    baseSepolia.id,
    anvil.id,
] as const;

type IconType = typeof EthereumCircleColorful;
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
        Icon: EthereumCircleColorful,
        text: mainnet.name,
        chainId: mainnet.id,
        externalLink: "https://cartesiscan.io",
    },

    {
        Icon: OptimismCircleColorful,
        text: optimism.name,
        chainId: optimism.id,
        externalLink: "https://optimism.cartesiscan.io",
    },
    {
        Icon: BaseCircleColorful,
        text: base.name,
        chainId: base.id,
        externalLink: "https://base.cartesiscan.io",
    },
];

const testnets: NetworkGroup[] = [
    {
        Icon: EthereumCircleColorful,
        text: sepolia.name,
        chainId: sepolia.id,
        externalLink: "https://sepolia.cartesiscan.io",
    },
    {
        Icon: OptimismCircleColorful,
        text: optimismSepolia.name,
        chainId: optimismSepolia.id,
        externalLink: "https://optimism-sepolia.cartesiscan.io",
    },

    {
        Icon: BaseCircleColorful,
        text: baseSepolia.name,
        chainId: baseSepolia.id,
        externalLink: "https://base-sepolia.cartesiscan.io",
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
                            <Icon style={{ fontSize: chainIconSize }} />
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
    const styles = {
        transform: `rotateZ(${up ? 0 : 180}deg)`,
        transitionTimingFunction: "ease-in-out",
        transitionDuration: "300ms",
        tansitionProperty: "all",
    };

    return <TbCaretUpFilled style={styles} size={18} />;
};

const getIconByChainId = cond([
    [
        (id: number) => includes(id, [mainnet.id, sepolia.id]),
        () => EthereumCircleColorful,
    ],
    [
        (id: number) => includes(id, [optimism.id, optimismSepolia.id]),
        () => OptimismCircleColorful,
    ],
    [
        (id: number) => includes(id, [base.id, baseSepolia.id]),
        () => BaseCircleColorful,
    ],
    [T, () => HardhatColorful],
]);

const MainIcon: FC<{ chainId: number }> = ({ chainId }) => {
    const Icon = getIconByChainId(chainId);
    return <Icon style={{ fontSize: 28 }} id={`chain-${chainId}-icon`} />;
};

export const CartesiScanChains = () => {
    const [isOpen, { close, open }] = useDisclosure(false);
    const config = useConfig();
    const chain = config.chains[0];
    const chainName = chain.name;

    return (
        <Menu
            withArrow
            withinPortal={false}
            onClose={close}
            onOpen={open}
            id="cartesiscan-chain-menu"
        >
            <Menu.Target>
                <Button variant="transparent" p={0}>
                    <Group gap={3}>
                        <VisuallyHidden>{chainName}</VisuallyHidden>
                        <MainIcon chainId={chain.id} />
                        <CaretIcon up={isOpen} />
                    </Group>
                </Button>
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
