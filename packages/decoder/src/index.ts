import { Interface, InterfaceAbi, TransactionDescription } from "ethers";
import { createPublicClient, Hex, http } from "viem";
import { sepolia } from "viem/chains";
import {
    fetchContractAbiResponseSchema,
    fetchFunctionInterface4ByteSchema,
    fetchFunctionInterfaceOpenApiSchema,
} from "./data/schema";

export async function fetchContractAbi({
    address,
    chainId,
}: {
    address: string;
    chainId: number;
}) {
    const response = await fetch(
        `https://anyabi.xyz/api/get-abi/${chainId}/${address}`,
    );
    const data = await response.json();
    const parsedData = fetchContractAbiResponseSchema.parse(data);
    return {
        abi: parsedData.abi as InterfaceAbi,
        name: parsedData.name,
    };
}

async function fetchFunctionFromOpenchain({ selector }: { selector: string }) {
    try {
        const requestUrl = new URL(
            "https://api.openchain.xyz/signature-database/v1/lookup",
        );
        const response = await fetch(requestUrl);
        const data = await response.json();
        const parsedData = fetchFunctionInterfaceOpenApiSchema.parse(data);
        if (!parsedData.ok) {
            throw new Error(
                `Openchain API failed to find function interface with selector ${selector}`,
            );
        }
        return parsedData.result.function[selector];
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function fetchFunctionFrom4Bytes({ selector }: { selector: string }) {
    try {
        const requestUrl = new URL(
            "https://www.4byte.directory/api/v1/signatures/",
        );
        requestUrl.searchParams.append("hex_signature", selector);
        const response = await fetch(requestUrl);
        const data = await response.json();
        const parsedData = fetchFunctionInterface4ByteSchema.parse(data);
        if (parsedData.count === 0) {
            throw new Error(
                `4bytes API failed to find function interface with selector ${selector}`,
            );
        }
        return parsedData.results;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function fetchFunctionInterface({
    selector,
}: {
    selector: string;
}): Promise<string | null> {
    const openChainData = await fetchFunctionFromOpenchain({ selector });

    let result: string | null = null;
    // giving priority to openchain data because it filters spam like: `mintEfficientN2M_001Z5BWH` for 0x00000000
    if (openChainData) {
        result = openChainData[0].name;
    } else {
        const fourByteData = await fetchFunctionFrom4Bytes({ selector });
        if (fourByteData) {
            result = fourByteData[0].text_signature;
        }
    }

    return result;
}

export function decodeWithABI({
    abi,
    calldata,
}: {
    abi: InterfaceAbi;
    calldata: string;
}): TransactionDescription | null {
    const abiInterface = new Interface(abi);
    const parsedTransaction = abiInterface.parseTransaction({ data: calldata });
    return parsedTransaction;
}

function decodeAllPossibilities({
    functionSignatures,
    calldata,
}: {
    functionSignatures: string[];
    calldata: string;
}) {
    const results: TransactionDescription[] = [];
    for (const signature of functionSignatures) {
        console.log(`Decoding calldata with signature ${signature}`);
        try {
            const parsedTransaction = decodeWithABI({
                abi: [`function ${signature}`],
                calldata,
            });
            if (parsedTransaction) {
                results.push(parsedTransaction);
            }
        } catch (error) {
            console.error(
                `Failed to decode calldata with signature ${signature}, skipping`,
            );
        }
    }
    console.log(`Decoded calldata with ${results.length} signatures`);
    return results;
}

export async function decodeFromTx(_fromTxInput: string, _chainId?: number) {
    let txHash = _fromTxInput;
    let parsedTransaction: TransactionDescription | null;
    console.log(txHash);
    try {
        const publicClient = createPublicClient({
            chain: sepolia,
            transport: http(),
        });
        const transaction = await publicClient.getTransaction({
            hash: txHash as Hex,
        });
        parsedTransaction = await decodeWithAddress({
            calldata: transaction.input,
            address: transaction.to!,
            chainId: 11155111,
        });
        if (parsedTransaction) {
            console.log("Should be here dumbasss");
            return {
                functionName: parsedTransaction.fragment.name,
                signature: parsedTransaction.signature,
                rawArgs: parsedTransaction.args,
            };
        } else {
            return null;
        }
    } catch (e) {
        console.log("Error Decoding");
        console.error(e);
    }
}

export async function decodeWithAddress({
    calldata,
    address,
    chainId = 11155111,
}: {
    calldata: string;
    address: string;
    chainId: number;
}): Promise<TransactionDescription | null> {
    console.log(
        `Decoding calldata with address ${address} on chain ${chainId}`,
    );
    try {
        const fetchedAbi = await fetchContractAbi({ address, chainId });
        const decodedFromAbi = decodeWithABI({
            abi: fetchedAbi.abi,
            calldata,
        });
        if (decodedFromAbi) {
            return decodedFromAbi;
        }
        console.log(
            `Failed to decode calldata with ABI for contract ${address} on chain ${chainId}, decoding with selector`,
        );
        const decodedWithSelector = await _decodeWithSelector(calldata);
        return decodedWithSelector;
    } catch (error) {
        console.error(
            `Failed to fetch decode calldata ${calldata} for contract ${address} on chain ${chainId}`,
        );
        return null;
    }
}

export const _decodeWithSelector = async (calldata: string) => {
    const selector = calldata.slice(0, 10);
    console.log(`Decoding calldata with selector ${selector}`);
    try {
        // tries to find function signature from openchain and 4bytes
        const fnInterface = await fetchFunctionInterface({ selector });
        if (!fnInterface) {
            throw new Error("");
        }
        // decodes calldata with all possible function signatures
        const decodedTransactions = decodeAllPossibilities({
            functionSignatures: [fnInterface],
            calldata,
        });

        if (decodedTransactions.length === 0) {
            throw new Error(
                "Failed to decode calldata with function signature",
            );
        }

        const result = decodedTransactions[0];
        console.log({ _decodeWithSelector: result });
        return result;
    } catch (error) {
        throw new Error(
            `Failed to find function interface for selector ${selector}`,
        );
    }
};

// async function testCall() {
//   let checkTx = await decodeFromTx("0x84f35b3a84576250d6ba6c526d848eb83e6aaa4ae770733595d0b9d503ec9993")
//   console.log(checkTx)
//   return checkTx
// }

// testCall()
