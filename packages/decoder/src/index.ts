import { whatsabi } from "@shazow/whatsabi";
import { decodeFunctionData } from "viem";
import { getProvider } from "./utils/provider";

/**
 * Asynchronously decodes a voucher payload using the provided ABI.
 *
 * @param destination - The destination address to be executed, expected to be a string prefixed with '0x'.
 *  @param params - The payload to decode, expected to be a string prefixed with '0x'.
 * @returns The decoded payload or null if an error occurs.
 */

export type DecodeVoucherPayloadParamsType = {
    destination: `0x${string}`;
    payload: `0x${string}`;
};

export type DecodeVoucherPayloadReturnType = {
    functionName: string;
    args: unknown[] | undefined;
};

export const decodeVoucherPayload = async ({
    destination,
    payload,
}: DecodeVoucherPayloadParamsType): Promise<DecodeVoucherPayloadReturnType> => {
    const provider = await getProvider();
    try {
        // Fetch the ABI using the destination address
        const destinationAddressAbi = await whatsabi.autoload(
            destination as string,
            { provider },
        );

        // Decode the payload using the fetched ABI
        const res = await decodeFunctionData({
            abi: destinationAddressAbi.abi,
            data: payload as `0x${string}`,
        });

        return {
            functionName: res.functionName,
            args: res.args as [],
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
};
