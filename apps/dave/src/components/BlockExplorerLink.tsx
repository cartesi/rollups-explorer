"use client";
import { Anchor, Flex, Text, rem } from "@mantine/core";
import { type FC } from "react";
import { TbExternalLink } from "react-icons/tb";
import type { Chain } from "viem";
import { useBlockExplorerData } from "../hooks/useBlockExplorerData";

export interface BlockExplorerLinkProps {
    value: string;
    type: "tx" | "block" | "address";
    chain: Chain;
}

export const BlockExplorerLink: FC<BlockExplorerLinkProps> = ({
    type,
    value,
    chain,
}) => {
    const { ok, text, url } = useBlockExplorerData(type, value, chain);

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
