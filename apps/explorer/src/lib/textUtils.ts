import { isAddress, isHash } from "viem";

const slicer = (str: string) => `${str.slice(0, 8)}...${str.slice(-6)}`;

export const shortenHash = (hash: string) => {
    if (isHash(hash)) {
        return slicer(hash);
    }
    return hash;
};

export const shortenAddress = (address: string) => {
    if (isAddress(address)) {
        return slicer(address);
    }
    return address;
};
