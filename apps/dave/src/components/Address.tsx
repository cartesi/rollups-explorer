"use client";

import {
    Anchor,
    Group,
    type GroupProps,
    type MantineStyleProp,
    Text,
    Tooltip,
} from "@mantine/core";
import Link from "next/link";
import { type FC } from "react";
import { jsNumberForAddress } from "react-jazzicon";
import Jazzicon from "react-jazzicon/dist/Jazzicon";
import { type Address as AddressType, getAddress } from "viem";
import CopyButton from "./CopyButton";

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
    const textStyle: MantineStyleProp = { wordBreak: "break-all" };

    const label = name ? (
        <Tooltip label={value} withArrow>
            <Text style={textStyle}>{name}</Text>
        </Tooltip>
    ) : shorten ? (
        <Tooltip label={value} withArrow>
            <Text style={textStyle}>{text}</Text>
        </Tooltip>
    ) : (
        <Text style={textStyle}>{text}</Text>
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
