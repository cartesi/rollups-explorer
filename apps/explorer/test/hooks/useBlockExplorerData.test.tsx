import { renderHook } from "@testing-library/react";
import { zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import { foundry, mainnet } from "wagmi/chains";
import { useBlockExplorerData } from "../../src/hooks/useBlockExplorerData";

const chainWithExplorer = mainnet;
const chainWithoutExplorer = foundry;

const txHash =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
const address = zeroAddress;

describe("useBlockExplorerData Hook", () => {
    describe("when chain has no block explorer", () => {
        it("should return ok: false", () => {
            const { result } = renderHook(() =>
                useBlockExplorerData("tx", txHash, chainWithoutExplorer),
            );
            expect(result.current.ok).toBe(false);
        });
    });

    describe("when value is empty", () => {
        it("should return ok: false for empty string", () => {
            const { result } = renderHook(() =>
                useBlockExplorerData("tx", "", chainWithExplorer),
            );
            expect(result.current.ok).toBe(false);
        });
    });

    describe("type: tx", () => {
        it("should return ok: true with shortened hash as text", () => {
            const { result } = renderHook(() =>
                useBlockExplorerData("tx", txHash, chainWithExplorer),
            );
            expect(result.current.ok).toBe(true);
            if (result.current.ok) {
                expect(result.current.text).toBe("0x123456...abcdef");
                expect(result.current.url).toBe(
                    `https://etherscan.io/tx/${txHash}`,
                );
            }
        });
    });

    describe("type: address", () => {
        it("should return ok: true with shortened address as text", () => {
            const { result } = renderHook(() =>
                useBlockExplorerData("address", address, chainWithExplorer),
            );
            expect(result.current.ok).toBe(true);
            if (result.current.ok) {
                expect(result.current.text).toBe("0x000000...000000");
                expect(result.current.url).toBe(
                    `https://etherscan.io/address/${address}`,
                );
            }
        });
    });

    describe("type: block", () => {
        it("should return ok: true with full value as text (no shortening)", () => {
            const { result } = renderHook(() =>
                useBlockExplorerData("block", "12345678", chainWithExplorer),
            );
            expect(result.current.ok).toBe(true);
            if (result.current.ok) {
                expect(result.current.text).toBe("12345678");
                expect(result.current.url).toBe(
                    "https://etherscan.io/block/12345678",
                );
            }
        });
    });
});
