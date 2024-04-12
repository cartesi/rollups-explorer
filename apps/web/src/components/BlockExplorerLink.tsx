import { Anchor, Group, Text, rem } from "@mantine/core";
import { anyPass, equals } from "ramda";
import { FC } from "react";
import { TbExternalLink } from "react-icons/tb";
import { useConfig } from "wagmi";

interface BlockExplorerLinkProps {
    value: string;
    type: "tx" | "block" | "address";
}

const isTxOrAddress = anyPass([equals("tx"), equals("address")]);

/**
 *
 * Works in conjuction with Wagmi. It requires a Wagmi-Provider to work as expected.
 * When running devnet it will not render a block-explorer link.
 *
 */
export const BlockExplorerLink: FC<BlockExplorerLinkProps> = ({
    value,
    type,
}) => {
    const config = useConfig();
    const explorerUrl = config.chains[0].blockExplorers?.default.url;

    if (!explorerUrl) return;

    const shouldShorten = isTxOrAddress(type);

    const text = shouldShorten
        ? `${value.slice(0, 8)}...${value.slice(-6)}`
        : value;

    const href = `${explorerUrl}/${type}/${value}`;

    return (
        <Anchor href={href} target="_blank">
            <Group gap="xs">
                <Text>{text}</Text>
                <TbExternalLink style={{ width: rem(21), height: rem(21) }} />
            </Group>
        </Anchor>
    );
};
