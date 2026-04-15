import { isHash } from "viem";
export const shortenHash = (hash: string) => {
    if (isHash(hash)) {
        return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
    }
    return hash;
};
