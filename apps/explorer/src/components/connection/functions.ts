import { createCartesiPublicClient } from "@cartesi/client";
import { descend, prop, sort } from "ramda";
import { BaseError, http } from "viem";
import type { DbNodeConnectionConfig } from "./types";

export const sortByTimestampDesc = sort<DbNodeConnectionConfig>(
    descend<DbNodeConnectionConfig>(prop("timestamp")),
);

type NodeMetaResult =
    | {
          status: "error";
          error: Error;
      }
    | {
          status: "success";
          nodeVersion: string;
          chainId: number;
      };

/** Viem's `message` is multi-line; `shortMessage` is the single sentence. */
const describeError = (error: unknown): string => {
    if (error instanceof BaseError) return error.shortMessage;
    if (error instanceof Error) return error.message;
    return String(error);
};

/**
 *
 * Request the rollups node's version and chain-id.
 * the returned object has status and adjacents properties based on it.
 *
 * @param cartesiNodeUrl
 */
export const fetchRollupsNodeMeta = async (
    cartesiNodeUrl: string,
): Promise<NodeMetaResult> => {
    const cartesiClient = createCartesiPublicClient({
        transport: http(cartesiNodeUrl, { timeout: 5000 }),
    });

    try {
        const { version, chainId } = await cartesiClient.getNodeInfo();

        return { status: "success", nodeVersion: version, chainId };
    } catch (error) {
        return {
            status: "error",
            error: new Error(`${cartesiNodeUrl}: ${describeError(error)}`),
        };
    }
};
