import { anyPass, complement, isEmpty, map, pipe, reduce } from "ramda";
import { isAddress, isHex } from "viem";
import { DepositData, FormValues } from "./context";

const isNotNumberOrInteger = anyPass<(val: number) => boolean>([
    Number.isNaN,
    complement(Number.isInteger),
]);

export const tokenIdValidation = (value: string) => {
    if (isEmpty(value)) return "Token id is required!";

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

const sumBatchFor = (tokenId: bigint) =>
    pipe(
        map<DepositData, bigint>((d) =>
            d.tokenId === tokenId ? d.amount : BigInt(0),
        ),
        reduce((acc, curr) => acc + curr, BigInt(0)),
    );

export const amountValidation = (value: string, values: FormValues) => {
    const amount = BigInt(value);
    if (amount === 0n) return "Invalid amount.";

    if (amount > values.balance)
        return "The amount should be smaller or equal to your balance.";

    if (values.mode === "batch") {
        const sum = sumBatchFor(BigInt(values.tokenId));
        const totalAmount = sum(values.batch ?? []) + amount;
        if (totalAmount > values.balance)
            return `You are above your balance for token id ${values.tokenId}. Delete an entry on review or change your amount.`;
    }

    return null;
};

export const hexValidation = (value: string) => {
    return isHex(value) ? null : "Invalid hex string";
};
