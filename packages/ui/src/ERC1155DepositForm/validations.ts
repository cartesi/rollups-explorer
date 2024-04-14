import { anyPass, complement, isEmpty } from "ramda";
import { isAddress, isHex } from "viem";

const isNotNumberOrInteger = anyPass<(val: number) => boolean>([
    Number.isNaN,
    complement(Number.isInteger),
]);

export const tokenIdValidation = (value: string) => {
    if (isEmpty(value)) return "token id is required!";

    const tokenId = Number(value);
    if (isNotNumberOrInteger(tokenId))
        return "Token id should be an integer value!";

    return null;
};

export const erc1155AddressValidation = (value: string) => {
    if (isEmpty(value)) return `ERC1155 address is required`;
    if (!isAddress(value)) {
        return `Invalid ERC1155 address`;
    }
    return null;
};

export const applicationValidation = (value: string) => {
    if (isEmpty(value)) return `Application address is required.`;
    if (!isAddress(value)) {
        return `Invalid Application address`;
    }
    return null;
};

export const amountValidation = (value: string) => {
    return value !== "" && Number(value) > 0 ? null : "Invalid amount";
};

export const hexValidation = (value: string) => {
    return isHex(value) ? null : "Invalid hex string";
};
