import { erc1155BatchPortalAbi } from "@cartesi/rollups-wagmi";
import { Specification } from "../../../src/components/specification/types";

/**
 * A simple stub for JSON_ABI type.
 */
export const erc1155JSONABISpecStub: Specification = {
    id: "1",
    timestamp: 10,
    mode: "json_abi",
    name: "ERC-1155 Specification",
    abi: erc1155BatchPortalAbi,
    version: 1,
    conditionals: [
        {
            conditions: [
                {
                    field: "application.address",
                    operator: "equals",
                    value: "some-value-here",
                },
                {
                    field: "msgSender",
                    operator: "equals",
                    value: "another-value-here",
                },
            ],
            logicalOperator: "or",
        },
    ],
};
