import { describe, expect, it } from "vitest";
import { toWire } from "../../../src/providers/mocknode/wire";

describe("toWire", () => {
    it("should snake case keys and encode bigints and dates", () => {
        expect(
            toWire({
                epochIndex: 10n,
                log2step: 44n,
                createdAt: new Date("2026-01-01T00:00:00.000Z"),
                snapshot: { asOfBlock: 0n, candidate: null },
                outputHashesSiblings: ["0x01"],
                maxConcurrentInspects: 10,
            }),
        ).toEqual({
            epoch_index: "0xa",
            log2step: "0x2c",
            created_at: "2026-01-01T00:00:00.000Z",
            snapshot: { as_of_block: "0x0", candidate: null },
            output_hashes_siblings: ["0x01"],
            max_concurrent_inspects: 10,
        });
    });

    it("should use the node names of the application contracts", () => {
        expect(
            toWire({
                applicationAddress: "0x1",
                consensusAddress: "0x2",
                inputBoxAddress: "0x3",
                inputBoxBlock: 3n,
            }),
        ).toEqual({
            iapplication_address: "0x1",
            iconsensus_address: "0x2",
            iinputbox_address: "0x3",
            iinputbox_block: "0x3",
        });
    });
});
