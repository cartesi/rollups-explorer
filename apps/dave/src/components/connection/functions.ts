import { createCartesiPublicClient } from "@cartesi/viem";
import { descend, isNil, prop, sort } from "ramda";
import { http } from "viem";
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

/**
 *
 * Request both rollups node's version and chain-id.
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

    const promises: [chainId: Promise<number>, nodeVersion: Promise<string>] = [
        cartesiClient.getChainId(),
        cartesiClient.getNodeVersion(),
    ];

    try {
        const [chainIdSettled, nodeVersionSettled] =
            await Promise.allSettled(promises);
        const bothFailed =
            chainIdSettled.status === "rejected" &&
            nodeVersionSettled.status === "rejected";
        if (bothFailed) {
            return {
                status: "error",
                error: new Error("Looks like the node is not responding."),
            };
        }

        const nodeVersion =
            nodeVersionSettled.status === "fulfilled"
                ? nodeVersionSettled.value
                : null;
        const chainId =
            chainIdSettled.status === "fulfilled" ? chainIdSettled.value : null;
        const errorMessages: string[] = [];

        if (isNil(nodeVersion))
            errorMessages.push("does not provide a node-version.");

        if (isNil(chainId)) errorMessages.push("does not provide a chain-id.");

        if (isNil(nodeVersion) || isNil(chainId))
            return {
                status: "error",
                error: new Error(
                    `${cartesiNodeUrl} ${errorMessages.join(" and ")}`,
                ),
            };

        return { status: "success", nodeVersion, chainId };
    } catch (error) {
        return { status: "error", error: error as Error };
    }
};
