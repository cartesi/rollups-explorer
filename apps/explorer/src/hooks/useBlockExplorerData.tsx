"use client";
import { anyPass, equals } from "ramda";
import { isNilOrEmpty } from "ramda-adjunct";
import type { Chain } from "viem";
import type { BlockExplorerLinkProps } from "../components/BlockExplorerLink";
import { shortenHash } from "../lib/textUtils";

const isTxOrAddress = anyPass([equals("tx"), equals("address")]);

export const useBlockExplorerData = (
    type: BlockExplorerLinkProps["type"],
    value: string,
    chain: Chain,
) => {
    const explorerUrl = chain.blockExplorers?.default.url;
    if (isNilOrEmpty(explorerUrl) || isNilOrEmpty(value))
        return { ok: false } as const;

    const shouldShorten = isTxOrAddress(type);

    const text = shouldShorten ? shortenHash(value) : value;

    const url = `${explorerUrl}/${type}/${value}`;

    return { ok: true, url, text } as const;
};
