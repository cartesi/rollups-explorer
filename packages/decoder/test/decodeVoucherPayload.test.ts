import { autoload, whatsabi } from "@shazow/whatsabi";
import { decodeFunctionData } from "viem";
import { describe, expect, it, vi } from "vitest";
import { decodeVoucherPayload } from "../src/index";
import { provider } from "../src/utils/provider";

vi.mock("@shazow/whatsabi");
const whatsAbiMocked = vi.mocked(autoload, true);
vi.mock("viem");
const viemMocked = vi.mocked(decodeFunctionData, true);

describe("decodeVoucherPayload", () => {
    it("should decode a valid payload", async () => {
        const mockAbi = { abi: "mockAbi" };
        const mockFunctionName = "testFunction";
        const mockArgs = ["arg1", "arg2"];

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
        expect(whatsabi.autoload).toHaveBeenCalledWith("0x123", { provider });
        expect(decodeFunctionData).toHaveBeenCalledWith({
            abi: mockAbi.abi,
            data: "0x456",
        });
    });

    it("should return the original payload on error", async () => {
        const error = new Error("Test error");
        const consoleError = vi.spyOn(console, "error");
        vi.spyOn(whatsabi, "autoload").mockRejectedValue(error);

        const result = await decodeVoucherPayload({
            destination: "0x123",
            payload: "0x456",
        });

        expect(result).toBe("0x456");
        expect(consoleError).toHaveBeenCalledWith(error);
    });
});
