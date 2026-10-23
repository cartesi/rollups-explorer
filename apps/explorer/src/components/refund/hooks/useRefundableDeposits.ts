"use client";
import type { Application, Input } from "@cartesi/client";
import {
    erc1155BatchPortalAddress,
    erc1155SinglePortalAddress,
    erc20PortalAddress,
    erc721PortalAddress,
    etherPortalAddress,
    useInputs,
} from "@cartesi/react";
import { isNotNil } from "ramda";
import { useMemo } from "react";
import { isForeclosed } from "../../application/utils";
import type { RefundableDeposit } from "../RefundableDeposits";
import {
    decodeDepositInput,
    refundStatusFromRead,
    toRefundAsset,
    type RefundAsset,
} from "../lib/refundUtils";
import { useRefundAssets } from "./useRefundAssets";
import { useRefundBoundary } from "./useRefundBoundary";
import { useRefundStatuses } from "./useRefundStatus";

interface Options {
    /** How many deposits to return, newest first. Default `3`. */
    limit?: number;
}

/**
 * Newest deposits of a foreclosed application after its last accepted epoch,
 * with their on-chain refund status and token metadata. Deposits are fetched
 * per portal sender, so generic inputs never hide them. The refund flags are
 * not polled: call `refetch` after a refund issued from the page.
 */
export const useRefundableDeposits = (
    application: Application | undefined,
    { limit = 3 }: Options = {},
) => {
    const enabled = isNotNil(application) && isForeclosed(application);
    const address = application?.applicationAddress;

    const boundary = useRefundBoundary(address, { enabled });
    const fromEpoch = boundary.epochIndex;
    const known = isNotNil(boundary.inputIndex);

    const portalInputs = {
        application: address,
        from: boundary.inputIndex,
        descending: true,
        limit,
        enabled: enabled && known,
    };
    const byPortal = [
        useInputs({ ...portalInputs, sender: etherPortalAddress }),
        useInputs({ ...portalInputs, sender: erc20PortalAddress }),
        useInputs({ ...portalInputs, sender: erc721PortalAddress }),
        useInputs({ ...portalInputs, sender: erc1155SinglePortalAddress }),
        useInputs({ ...portalInputs, sender: erc1155BatchPortalAddress }),
    ];
    const [ether, erc20, erc721, erc1155, erc1155Batch] = byPortal.map(
        (query) => query.data?.data,
    );

    const { selected, indices, rawAssets } = useMemo(() => {
        const selected: Input[] = [];
        const indices: bigint[] = [];
        const rawAssets: RefundAsset[] = [];
        if (enabled && isNotNil(fromEpoch)) {
            const newestFirst = [
                ...(ether ?? []),
                ...(erc20 ?? []),
                ...(erc721 ?? []),
                ...(erc1155 ?? []),
                ...(erc1155Batch ?? []),
            ].sort((a, b) =>
                a.index < b.index ? 1 : a.index > b.index ? -1 : 0,
            );
            for (const input of newestFirst) {
                if (selected.length === limit) break;
                const deposit = decodeDepositInput(input);
                if (!deposit || input.epochIndex < fromEpoch) continue;
                selected.push(input);
                indices.push(input.index);
                rawAssets.push(toRefundAsset(deposit));
            }
        }
        return { selected, indices, rawAssets };
    }, [
        enabled,
        ether,
        erc20,
        erc721,
        erc1155,
        erc1155Batch,
        fromEpoch,
        limit,
    ]);

    const statuses = useRefundStatuses(address, indices, { enabled });
    const assets = useRefundAssets(rawAssets, { enabled });

    const deposits = useMemo<RefundableDeposit[]>(
        () =>
            selected.map((input, i) => ({
                input,
                asset: assets[i] ?? rawAssets[i],
                status: refundStatusFromRead(
                    statuses.byIndex.get(input.index),
                    statuses.failed.has(input.index),
                ),
            })),
        [selected, assets, rawAssets, statuses.byIndex, statuses.failed],
    );

    return {
        deposits,
        isLoading:
            enabled &&
            (boundary.isLoading ||
                (known && byPortal.some((query) => query.isLoading)) ||
                (selected.length > 0 && statuses.isLoading)),
        refetch: statuses.refetch,
    };
};
