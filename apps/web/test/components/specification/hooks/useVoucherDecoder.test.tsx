import { whatsabi } from "@shazow/whatsabi";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, it, vi } from "vitest";
import useVoucherDecoder from "../../../../src/components/specification/hooks/useVoucherDecoder";
import { stringifyContent } from "../../../../src/components/specification/utils";
import { voucherDecoderStubs } from "./stubs";

vi.mock("@shazow/whatsabi");

const whatabiMock = vi.mocked(whatsabi, true);

const {
    chainId,
    destination,
    payload,
    validABIByDestination,
    destination2,
    payload2,
} = voucherDecoderStubs;

describe("useVoucherDecoder hook", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should have initial status value as idle and data null", () => {
        const { result } = renderHook(() =>
            //@ts-ignore
            useVoucherDecoder({ destination: "", chainId, payload: "" }),
        );
        expect(result.current.status).toStrictEqual("idle");
        expect(result.current.data).toStrictEqual(null);
    });

    it("should change status to loading when fetching starts", async () => {
        const promise = new Promise<whatsabi.AutoloadResult>(
            (resolve, reject) => {
                setTimeout(() =>
                    resolve({
                        abi: validABIByDestination[destination],
                        address: destination,
                        proxies: [],
                    }),
                ),
                    500;
            },
        );

        whatabiMock.autoload.mockReturnValue(promise);

        const { result } = renderHook(() =>
            useVoucherDecoder({ destination, chainId: 11155111, payload }),
        );

        await waitFor(() => expect(result.current.status).toEqual("loading"));
    });

    it("should return the payload decoded when returned abi is correct", async () => {
        whatabiMock.autoload.mockResolvedValue({
            abi: validABIByDestination[destination],
            address: destination,
            proxies: [],
        });

        const { result } = renderHook(() =>
            useVoucherDecoder({ destination, chainId, payload }),
        );

        await waitFor(() => expect(result.current.data).not.toEqual(null));

        expect(result.current.data).toEqual(
            stringifyContent({
                functionName: "transfer",
                args: ["0x0769E15F8d7042969AeB78E73b54192b3c4eC8bC", "500000"],
                orderedNamedArgs: [
                    ["address", "0x0769E15F8d7042969AeB78E73b54192b3c4eC8bC"],
                    ["uint256", "500000"],
                ],
            }),
        );
    });

    describe("Decoding failures", () => {
        it("should return the original payload format", async () => {
            whatabiMock.autoload.mockResolvedValue({
                abi: validABIByDestination[destination2],
                address: destination2,
                proxies: [],
            });

            const { result } = renderHook(() =>
                useVoucherDecoder({
                    destination: destination2,
                    chainId,
                    payload: payload2,
                }),
            );

            await waitFor(() => expect(result.current.data).not.toEqual(null));

            expect(result.current.data).toStrictEqual(payload2);
        });

        it("should log an info message about the error", async () => {
            whatabiMock.autoload.mockResolvedValue({
                abi: validABIByDestination[destination2],
                address: destination2,
                proxies: [],
            });

            const logSpy = vi.spyOn(console, "info");

            const { result } = renderHook(() =>
                useVoucherDecoder({
                    destination: destination2,
                    chainId,
                    payload: payload2,
                }),
            );

            await waitFor(() => expect(result.current.data).not.toEqual(null));

            expect(logSpy)
                .toHaveBeenCalledWith(`Skipping voucher decoding. Reason: Encoded function signature \"0xa9059cbb\" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.
You can look up the signature here: https://openchain.xyz/signatures?query=0xa9059cbb.`);

            logSpy.mockRestore();
        });
    });
});
