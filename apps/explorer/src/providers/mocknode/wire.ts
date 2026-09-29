import { numberToHex } from "viem";

const renamedKeys: Record<string, string> = {
    applicationAddress: "iapplication_address",
    consensusAddress: "iconsensus_address",
    inputBoxAddress: "iinputbox_address",
    inputBoxBlock: "iinputbox_block",
};

const toSnakeCase = (key: string) =>
    renamedKeys[key] ??
    key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

/**
 * Serialize a typed entity the way the node sends it: snake_case keys,
 * bigints as hex quantities and dates as ISO strings.
 */
export const toWire = (value: unknown): unknown => {
    if (typeof value === "bigint") return numberToHex(value);
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map(toWire);
    if (value !== null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, field]) => [
                toSnakeCase(key),
                toWire(field),
            ]),
        );
    }
    return value;
};
