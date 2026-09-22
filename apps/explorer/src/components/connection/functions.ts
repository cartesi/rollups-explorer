import { createCartesiPublicClient } from "@cartesi/client";
import { descend, prop, sort } from "ramda";
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
    } catch {
        return {
            status: "error",
            error: new Error("Looks like the node is not responding."),
        };
    }
};
