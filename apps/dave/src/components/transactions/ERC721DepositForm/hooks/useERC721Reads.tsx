import { BaseError, type Hex, erc721Abi } from "viem";
import { useReadContracts } from "wagmi";
import useWatchQueryOnBlockChange from "../../hooks/useWatchQueryOnBlockChange";

interface Props {
    erc721Address: Hex;
    ownerAddress: Hex;
}

export const useERC721Reads = ({ erc721Address, ownerAddress }: Props) => {
    const erc721Contract = {
        abi: erc721Abi,
        address: erc721Address,
    };

    const erc721 = useReadContracts({
        contracts: [
            { ...erc721Contract, functionName: "symbol" },
            {
                ...erc721Contract,
                functionName: "balanceOf",
                args: [ownerAddress!],
            },
        ],
    });

    useWatchQueryOnBlockChange(erc721.queryKey);

    const { isLoading, isSuccess } = erc721;
    const symbol = erc721.data?.[0].result ?? "";
    const balance = erc721.data?.[1].result;
    const errors = erc721.data
        ? erc721.data
              .filter((d) => d.error instanceof Error)
              .map((d) => (d.error as BaseError).shortMessage)
        : [];
    const hasPositiveBalance = balance !== undefined && balance > 0;

    return {
        symbol,
        balance,
        errors,
        hasPositiveBalance,
        isLoading,
        isSuccess,
    };
};

export type UseERC721ReadsReturn = ReturnType<typeof useERC721Reads>;
