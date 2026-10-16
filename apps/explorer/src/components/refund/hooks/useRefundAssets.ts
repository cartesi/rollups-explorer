"use client";
import { isNotNil } from "ramda";
import { useMemo } from "react";
import { erc20Abi, type Address, type ContractFunctionParameters } from "viem";
import { useReadContracts } from "wagmi";
import type { RefundAsset } from "../lib/refundUtils";

interface Options {
    enabled?: boolean;
}

type TokenMetadata = { symbol?: string; decimals?: number };

type Slot = { address: Address; field: keyof TokenMetadata };

/** One read per token field, `decimals` only for ERC-20 assets. */
const collectSlots = (assets: RefundAsset[]) => {
    const fields = new Map<Address, Set<keyof TokenMetadata>>();
    for (const asset of assets) {
        if (asset.kind === "ether") continue;
        const set = fields.get(asset.token) ?? new Set(["symbol"]);
        if (asset.kind === "erc20") set.add("decimals");
        fields.set(asset.token, set);
    }
    return [...fields].flatMap(([address, set]) =>
        [...set].map((field): Slot => ({ address, field })),
    );
};

const toContract = ({ address, field }: Slot): ContractFunctionParameters => ({
    abi: erc20Abi,
    address,
    functionName: field,
});

/**
 * Complete the assets with `symbol` (and `decimals` for ERC-20) read on
 * chain in one batch per distinct token, cached forever. A token without
 * `symbol` keeps its address.
 */
export const useRefundAssets = (
    assets: RefundAsset[],
    { enabled = true }: Options = {},
): RefundAsset[] => {
    const slots = useMemo(() => collectSlots(assets), [assets]);
    const contracts = useMemo(() => slots.map(toContract), [slots]);

    const query = useReadContracts({
        contracts,
        allowFailure: true,
        query: {
            enabled: enabled && contracts.length > 0,
            staleTime: Infinity,
        },
    });

    const data = query.data;
    return useMemo(() => {
        const metadata = new Map<Address, TokenMetadata>();
        slots.forEach(({ address, field }, i) => {
            const read = data?.[i];
            if (read?.status !== "success") return;
            metadata.set(address, {
                ...metadata.get(address),
                [field]: read.result,
            });
        });

        return assets.map((asset) => {
            if (asset.kind === "ether") return asset;
            const { symbol, decimals } = metadata.get(asset.token) ?? {};
            return {
                ...asset,
                symbol,
                ...(asset.kind === "erc20" && { decimals }),
            };
        });
    }, [assets, slots, data]);
};

export const useRefundAsset = (
    asset: RefundAsset | undefined,
    options: Options = {},
): RefundAsset | undefined => {
    const assets = useMemo(() => (isNotNil(asset) ? [asset] : []), [asset]);
    const [resolved] = useRefundAssets(assets, options);
    return resolved;
};
