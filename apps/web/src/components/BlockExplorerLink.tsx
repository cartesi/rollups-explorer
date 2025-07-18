import { Anchor, Group, Text, rem, Flex } from "@mantine/core";
import { anyPass, equals } from "ramda";
import { isNilOrEmpty } from "ramda-adjunct";
import { FC } from "react";
import { TbExternalLink } from "react-icons/tb";
import { useConfig } from "wagmi";
import { shortenHash } from "../lib/textUtils";

interface BlockExplorerLinkProps {
    value: string;
    type: "tx" | "block" | "address";
}

const isTxOrAddress = anyPass([equals("tx"), equals("address")]);

export const useBlockExplorerData = (
    type: BlockExplorerLinkProps["type"],
    value: string,
) => {
    const config = useConfig();
    const explorerUrl = config.chains[0].blockExplorers?.default.url;

    if (isNilOrEmpty(explorerUrl) || isNilOrEmpty(value))
        return { ok: false } as const;

    const shouldShorten = isTxOrAddress(type);

    const text = shouldShorten ? shortenHash(value) : value;

    const url = `${explorerUrl}/${type}/${value}`;

    return { ok: true, url, text } as const;
};

/**
 *
 * Works in conjunction with Wagmi. It requires a Wagmi-Provider to work as expected.
 * When running devnet it will not render a block-explorer link.
 *
 */
export const BlockExplorerLink: FC<BlockExplorerLinkProps> = ({
    value,
    type,
}) => {
    const { ok, text, url } = useBlockExplorerData(type, value);

    if (!ok) return null;

    return (
        <Anchor href={url} target="_blank">
            <Flex gap="xs" align="center">
                <Text>{text}</Text>
                <TbExternalLink style={{ width: rem(21), height: rem(21) }} />
            </Flex>
        </Anchor>
    );
};
