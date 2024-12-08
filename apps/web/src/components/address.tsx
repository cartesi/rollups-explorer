"use client";

import {
    ActionIcon,
    Anchor,
    CopyButton,
    Group,
    rem,
    Text,
    Tooltip,
} from "@mantine/core";
import Link from "next/link";
import { FC } from "react";
import { TbCheck, TbCopy } from "react-icons/tb";
import { jsNumberForAddress } from "react-jazzicon";
import Jazzicon from "react-jazzicon/dist/Jazzicon";
import { Address as AddressType, getAddress } from "viem";

import RollupContractResolver from "../lib/rollupContractResolver";

export type AddressProps = {
    value: AddressType;
    href?: string;
    hrefTarget?: "_self" | "_blank" | "_top" | "_parent";
    icon?: boolean;
    iconSize?: number;
    shorten?: boolean;
};

const Address: FC<AddressProps> = ({
    href,
    value,
    icon,
    iconSize,
    shorten,
    hrefTarget = "_self",
}) => {
    value = getAddress(value);
    const name = RollupContractResolver.resolveName(value);
    const text = shorten ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;

    const label = name ? (
        <Tooltip label={value} withArrow>
            <Text>{name}</Text>
        </Tooltip>
    ) : shorten ? (
        <Tooltip label={value} withArrow>
            <Text>{text}</Text>
        </Tooltip>
    ) : (
        <Text>{text}</Text>
    );
    return (
        <Group gap={10}>
            {icon && (
                <Jazzicon
                    diameter={iconSize ?? 20}
                    seed={jsNumberForAddress(value)}
                />
            )}

            {href ? (
                <Anchor href={href} component={Link} target={hrefTarget}>
                    {label}
                </Anchor>
            ) : (
                label
            )}
            <CopyButton value={value} timeout={2000}>
                {({ copied, copy }) => (
                    <Tooltip
                        label={copied ? "Copied" : "Copy"}
                        withArrow
                        position="right"
                    >
                        <ActionIcon
                            color={copied ? "teal" : "gray"}
                            variant="subtle"
                            onClick={copy}
                        >
                            {copied ? (
                                <TbCheck style={{ width: rem(16) }} />
                            ) : (
                                <TbCopy style={{ width: rem(16) }} />
                            )}
                        </ActionIcon>
                    </Tooltip>
                )}
            </CopyButton>
        </Group>
    );
};

export default Address;
