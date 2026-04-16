"use client";
import { isNilOrEmpty } from "ramda-adjunct";
import type { Chain } from "viem";
import type { BlockExplorerLinkProps } from "../components/BlockExplorerLink";
import { shortenAddress, shortenHash } from "../lib/textUtils";

const transformTextByType = (
    type: BlockExplorerLinkProps["type"],
    value: string,
) => {
    switch (type) {
        case "tx":
            return shortenHash(value);
        case "address":
            return shortenAddress(value);
        default:
            return value;
    }
};

export const useBlockExplorerData = (
    type: BlockExplorerLinkProps["type"],
    value: string,
    chain: Chain,
) => {
    const explorerUrl = chain.blockExplorers?.default.url;
    if (isNilOrEmpty(explorerUrl) || isNilOrEmpty(value))
        return { ok: false } as const;

    const text = transformTextByType(type, value);

    const url = `${explorerUrl}/${type}/${value}`;

    return { ok: true, url, text } as const;
};
