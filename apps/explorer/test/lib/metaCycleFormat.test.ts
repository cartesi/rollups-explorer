import { describe, expect, it } from "vitest";
import {
    formatMetaCycle,
    formatMetaCycleRange,
    formatMetaSpan,
} from "../../src/lib/metaCycleFormat";

const meta = (input: bigint, mcycle: bigint, ucycle = 0n) =>
    (input << 68n) + (mcycle << 20n) + ucycle;

describe("metaCycleFormat", () => {
    describe("formatMetaCycle", () => {
        it("should omit a zero ucycle", () => {
            expect(formatMetaCycle(meta(5n, 7n))).toBe("Input #5 · mcycle 7");
        });

        it("should show a non zero ucycle", () => {
            expect(formatMetaCycle(meta(5n, 104_857_600n, 42n))).toBe(
                "Input #5 · mcycle 104,857,600 · ucycle 42",
            );
        });
    });

    describe("formatMetaCycleRange", () => {
        it("should show the whole epoch as inputs", () => {
            expect(formatMetaCycleRange([0n, 1n << 92n])).toBe(
                "Input #0 – #16,777,215 · whole epoch",
            );
        });

        it("should show a range of whole inputs", () => {
            expect(formatMetaCycleRange([meta(8n, 0n), meta(12n, 0n)])).toBe(
                "Input #8 – #11",
            );
        });

        it("should show a single whole input", () => {
            expect(formatMetaCycleRange([meta(3n, 0n), meta(4n, 0n)])).toBe(
                "Input #3 · whole input slot",
            );
        });

        it("should show the mcycles of a root leaf within one input", () => {
            const start = meta(3n, 21_990_349_996_032n);
            expect(formatMetaCycleRange([start, start + (1n << 44n)])).toBe(
                "Input #3 · mcycle 21,990,349,996,032 – 21,990,366,773,247",
            );
        });

        it("should show the ucycles within one mcycle", () => {
            const start = meta(3n, 21_990_354_846_085n, 512n);
            expect(formatMetaCycleRange([start, start + 128n])).toBe(
                "Input #3 · mcycle 21,990,354,846,085 · ucycle 512 – 639",
            );
        });

        it("should show ucycles across mcycles of one input", () => {
            expect(
                formatMetaCycleRange([meta(3n, 10n, 5n), meta(3n, 12n, 6n)]),
            ).toBe("Input #3 · mcycle 10 · ucycle 5 – mcycle 12 · ucycle 5");
        });

        it("should show both ends when a range crosses inputs unaligned", () => {
            expect(formatMetaCycleRange([meta(3n, 10n), meta(4n, 20n)])).toBe(
                "Input #3 · mcycle 10 – Input #4 · mcycle 19 · ucycle 1,048,575",
            );
        });
    });

    describe("formatMetaSpan", () => {
        it.each([
            [92n, "16,777,216 input slots"],
            [68n, "1 input slot"],
            [44n, "16,777,216 mcycles"],
            [27n, "128 mcycles"],
            [0n, "1 ucycle"],
            [7n, "128 ucycles"],
        ])("should express 2^%s meta-cycles as %s", (log2, expected) => {
            expect(formatMetaSpan(log2)).toBe(expected);
        });
    });
});
