import type { EpochStatus, Input } from "@cartesi/client";
import { decodeDeposit, type Deposit } from "@cartesi/codec";
import { isNil, isNotNil } from "ramda";
import { formatUnits, type Address } from "viem";
import { content } from "../../../content";
import { shortenAddress } from "../../../lib/textUtils";

const text = content.refund;

/**
 * - `refundable`: epoch not finalized before foreclosure
 * - `refunding`: transaction sent, waiting for the receipt
 * - `refunded`: `wasRefundForInputIssued` is true on chain
 * - `failed`: the call reverted
 * - `unknown`: the on-chain flag is still being read
 * - `unavailable`: the on-chain flag could not be read
 */
export type RefundStatus =
    | "refundable"
    | "refunding"
    | "refunded"
    | "failed"
    | "unknown"
    | "unavailable";

export type RefundAssetItem = { tokenId: bigint; value: bigint };

export type RefundAsset =
    | { kind: "ether"; depositor: Address; value: bigint }
    | {
          kind: "erc20";
          depositor: Address;
          token: Address;
          value: bigint;
          symbol?: string;
          decimals?: number;
      }
    | {
          kind: "erc721";
          depositor: Address;
          token: Address;
          tokenId: bigint;
          symbol?: string;
      }
    | {
          kind: "erc1155";
          depositor: Address;
          token: Address;
          tokenId: bigint;
          value: bigint;
          symbol?: string;
      }
    | {
          kind: "erc1155-batch";
          depositor: Address;
          token: Address;
          items: RefundAssetItem[];
          symbol?: string;
      };

/** `undefined` when the sender is not a portal or the payload is malformed. */
export const decodeDepositInput = (
    input: Pick<Input, "decodedData">,
): Deposit | undefined => {
    const { decodedData } = input;
    if (isNil(decodedData)) return undefined;
    try {
        return decodeDeposit({
            msgSender: decodedData.sender,
            payload: decodedData.payload,
        });
    } catch {
        return undefined;
    }
};

export const toRefundAsset = (deposit: Deposit): RefundAsset => {
    switch (deposit.type) {
        case "EtherDeposit":
            return {
                kind: "ether",
                depositor: deposit.sender,
                value: deposit.value,
            };
        case "Erc20Deposit":
            return {
                kind: "erc20",
                depositor: deposit.sender,
                token: deposit.token,
                value: deposit.value,
            };
        case "Erc721Deposit":
            return {
                kind: "erc721",
                depositor: deposit.sender,
                token: deposit.token,
                tokenId: deposit.tokenId,
            };
        case "Erc1155SingleDeposit":
            return {
                kind: "erc1155",
                depositor: deposit.sender,
                token: deposit.token,
                tokenId: deposit.tokenId,
                value: deposit.value,
            };
        case "Erc1155BatchDeposit":
            return {
                kind: "erc1155-batch",
                depositor: deposit.sender,
                token: deposit.token,
                items: deposit.tokenIds.map((tokenId, i) => ({
                    tokenId,
                    value: deposit.values[i] ?? 0n,
                })),
            };
    }
};

const tokenLabel = (token: Address, symbol?: string) =>
    symbol ?? shortenAddress(token);

/** e.g. "1.5 ETH", "250 USDC", "BAYC #7", "3 × #7 of GAME", "2 token ids of GAME". */
export const formatRefundAsset = (asset: RefundAsset): string => {
    switch (asset.kind) {
        case "ether":
            return `${formatUnits(asset.value, 18)} ETH`;
        case "erc20":
            return isNil(asset.decimals) || isNil(asset.symbol)
                ? `${asset.value.toString()} ${text.unitsTxt} ${shortenAddress(asset.token)}`
                : `${formatUnits(asset.value, asset.decimals)} ${asset.symbol}`;
        case "erc721":
            return isNil(asset.symbol)
                ? `token ${text.tokenIdTxt}${asset.tokenId} of ${shortenAddress(asset.token)}`
                : `${asset.symbol} ${text.tokenIdTxt}${asset.tokenId}`;
        case "erc1155":
            return `${asset.value} × ${text.tokenIdTxt}${asset.tokenId} of ${tokenLabel(asset.token, asset.symbol)}`;
        case "erc1155-batch":
            return `${asset.items.length} ${text.tokenIdsTxt} ${tokenLabel(asset.token, asset.symbol)}`;
    }
};

const isKnownRefundError = (name: string): name is keyof typeof text.errors =>
    name in text.errors;

export interface RefundError {
    /** Custom error the application reverted with, when decodable. */
    revertName?: string;

    /** Reason string bubbled up from a token contract. */
    reason?: string;
}

/** Plain copy for a failed refund call, with a generic sentence as fallback. */
export const refundErrorMessage = ({
    revertName,
    reason,
}: RefundError = {}): string => {
    if (isNotNil(revertName) && isKnownRefundError(revertName))
        return text.errors[revertName];
    if (isNotNil(reason) && reason !== "")
        return `${text.tokenRevertedTxt} ${reason}`;
    return text.failedTxt;
};

export const isRefundableEpoch = (epochStatus: EpochStatus): boolean =>
    epochStatus !== "CLAIM_ACCEPTED";

export const refundStatusFromRead = (
    refundIssued: boolean | undefined,
    failed = false,
): RefundStatus => {
    if (failed) return "unavailable";
    if (isNil(refundIssued)) return "unknown";
    return refundIssued ? "refunded" : "refundable";
};
