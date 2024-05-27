import { autoload, whatsabi } from "@shazow/whatsabi";
import { ethers } from "ethers";
import { decodeFunctionData } from "viem";
import { describe, expect, it, vi } from "vitest";
import { decodeVoucherPayload } from "../src/index";
import { getProvider } from "../src/utils/provider";

vi.mock("@shazow/whatsabi");
const whatsAbiMocked = vi.mocked(autoload, true);
vi.mock("viem");
const viemMocked = vi.mocked(decodeFunctionData, true);
// Mocking the getProvider utility
vi.mock("../src/utils/provider", () => ({
    getProvider: vi.fn(),
}));
const providerMocked = vi.mocked(getProvider, true);

describe("decodeVoucherPayload", () => {
    it("should decode a valid payload", async () => {
        const mockAbi = { abi: "mockAbi" };
        const mockFunctionName = "testFunction";
        const mockArgs = ["arg1", "arg2"];
        const mockProvider = new ethers.JsonRpcProvider(
            `https://eth-sepolia.g.alchemy.com/v2/test-api-key`,
        );

        providerMocked.mockResolvedValue(mockProvider);
        whatsAbiMocked.mockResolvedValue(mockAbi as unknown as any);
        viemMocked.mockReturnValue({
            functionName: mockFunctionName,
            args: mockArgs,
        } as unknown as any);

        const result = await decodeVoucherPayload({
            destination: "0x123",
            payload: "0x456",
        });

        expect(result).toEqual({
            functionName: mockFunctionName,
            args: mockArgs,
        });
        expect(whatsabi.autoload).toHaveBeenCalledWith("0x123", {
            provider: mockProvider,
        });
        expect(decodeFunctionData).toHaveBeenCalledWith({
            abi: mockAbi.abi,
            data: "0x456",
        });
    });

    it("should throw an error if the decode is not successful", async () => {
        const mockError = "ABI loading failed";
        const consoleError = vi.spyOn(console, "error");
        vi.spyOn(whatsabi, "autoload").mockRejectedValue(mockError);

        await expect(
            decodeVoucherPayload({
                destination: "0x123",
                payload: "0x456",
            }),
        ).rejects.toThrow(mockError);
        expect(consoleError).toHaveBeenCalledWith(mockError);
    });
});
