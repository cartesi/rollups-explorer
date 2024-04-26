import { whatsabi } from "@shazow/whatsabi";
import { decodeFunctionData } from "viem";
import abisJson from "./data/abis.json";
import { provider } from "./utils/provider";

/**
 * Asynchronously decodes a voucher payload using the provided ABI.
 *
 * @param payload - The payload to decode, expected to be a string prefixed with '0x'.
 * @returns The decoded payload or null if an error occurs.
 */
const decodeVoucherPayload = async (
    payload: `0x${string}`,
): Promise<unknown | null> => {
    try {
        // Decode the function data to get the voucher payload
        const { args: voucherPayload } = decodeFunctionData({
            abi: abisJson,
            data: payload,
        });

        // Fetch the ABI using the address from the voucher payload
        const fetchedAbi = await whatsabi.autoload(
            voucherPayload![0] as string,
            { provider },
        );

        // Decode the payload using the fetched ABI
        const { args: decodedPayload } = decodeFunctionData({
            abi: fetchedAbi.abi,
            data: voucherPayload![1] as `0x${string}`,
        });
        return decodedPayload;
    } catch (error) {
        console.error(error);
        return null;
    }
};
