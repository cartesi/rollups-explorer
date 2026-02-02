import { cond, identity, T } from "ramda";
import { hexToString, isHex } from "viem";
import type { DecoderType } from "../components/types";

/**
 * Check if the content is a Hex value and tries to parse it to a readable string
 * in case of failure it will return the original string content.
 * @param content
 * @returns
 */
export const asText = (content: string): string => {
    try {
        if (isHex(content)) return hexToString(content);
        return content;
    } catch (error) {
        console.error((error as Error).message);
        return content;
    }
};

/**
 * Check if the content is a Hex value (0x...) parsing to string value and then
 * parsing the JSON and applying spacing. In case of failure the original string content is returned
 * @param content
 * @returns
 */
export const asJson = (content: string): string => {
    try {
        const text = asText(content);
        return JSON.stringify(JSON.parse(text), null, 2);
    } catch (error) {
        console.error((error as Error).message);
        return content;
    }
};

export const getDecoder = cond([
    [(decoderType: DecoderType) => decoderType === "text", () => asText],
    [(decoderType: DecoderType) => decoderType === "json", () => asJson],
    [T, () => identity],
]);
