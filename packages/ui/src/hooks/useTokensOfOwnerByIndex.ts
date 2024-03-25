import { Address, useContractReads } from "wagmi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { erc721ABI } from "@cartesi/rollups-wagmi";

const erc721AbiEnumerable = [
    ...erc721ABI,
    {
        stateMutability: "view",
        type: "function",
        inputs: [
            {
                name: "owner",
                type: "address",
            },
            {
                name: "index",
                type: "uint256",
            },
        ],
        name: "tokenOfOwnerByIndex",
        outputs: [
            {
                name: "tokenId",
                type: "uint256",
            },
        ],
    },
] as const;

export default function useTokensOfOwnerByIndex(
    erc721ContractAddress: Address,
    ownerAddress: Address,
    depositedTokens: bigint[] = [],
) {
    const [index, setIndex] = useState(0);
    const [tokenIds, setTokenIds] = useState<bigint[]>([]);
    const [fetching, setFetching] = useState(true);
    const lastErc721ContractAddress = useRef(erc721ContractAddress);
    const lastOwnerAddress = useRef(ownerAddress);
    const erc721 = useContractReads({
        contracts: [
            {
                abi: erc721AbiEnumerable,
                address: erc721ContractAddress,
                functionName: "tokenOfOwnerByIndex",
                args: [ownerAddress!, BigInt(index)],
            },
        ],
        enabled:
            erc721ContractAddress?.toString() !== "" &&
            ownerAddress?.toString() !== "",
        watch: true,
    });
    const tokenOfOwnerByIndex = erc721.data?.[0];

    const onChange = useCallback(() => {
        const isExisting =
            erc721ContractAddress === lastErc721ContractAddress.current &&
            ownerAddress === lastOwnerAddress.current;

        lastErc721ContractAddress.current = erc721ContractAddress;
        lastOwnerAddress.current = ownerAddress;

        if (tokenOfOwnerByIndex?.status === "success") {
            setTokenIds((prevTokenIds) =>
                isExisting
                    ? [...prevTokenIds, tokenOfOwnerByIndex.result as bigint]
                    : [tokenOfOwnerByIndex.result as bigint],
            );
            setIndex((prevIndex) => (isExisting ? prevIndex + 1 : 1));
            setFetching(true);
        } else {
            setTokenIds((prevTokenIds) => (isExisting ? prevTokenIds : []));
            setIndex((prevIndex) => (isExisting ? prevIndex : 0));
            setFetching(false);
        }
    }, [tokenOfOwnerByIndex, erc721ContractAddress, ownerAddress]);

    useEffect(() => {
        onChange();
    }, [onChange]);

    return useMemo(
        () => ({
            tokenIds: [...tokenIds]
                .filter((tokenId) => !depositedTokens.includes(tokenId))
                .sort(),
            fetching,
        }),
        [tokenIds, fetching, depositedTokens],
    );
}
