"use client";

import { Anchor, Group, GroupProps, Text, Tooltip } from "@mantine/core";
import Link from "next/link";
import { FC } from "react";
import { jsNumberForAddress } from "react-jazzicon";
import Jazzicon from "react-jazzicon/dist/Jazzicon";
import { Address as AddressType, getAddress } from "viem";
import CopyButton from "./copyButton";

import RollupContractResolver from "../lib/rollupContractResolver";
import { shortenHash } from "../lib/textUtils";

export interface AddressProps extends GroupProps {
    value: AddressType;
    href?: string;
    hrefTarget?: "_self" | "_blank" | "_top" | "_parent";
    icon?: boolean;
    iconSize?: number;
    shorten?: boolean;
    canCopy?: boolean;
}

const Address: FC<AddressProps> = ({
    href,
    value,
    icon,
    iconSize,
    shorten,
    hrefTarget = "_self",
    canCopy = true,
    ...restProps
}) => {
    value = getAddress(value);
    const name = RollupContractResolver.resolveName(value);
    const text = shorten ? shortenHash(value) : value;

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
        <Group gap={0} {...restProps}>
            <Group gap={8}>
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
            </Group>
            {canCopy && <CopyButton value={value} />}
        </Group>
    );
};

export default Address;
