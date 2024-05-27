import { ethers } from "ethers";

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

// Define the RPC URLs for each network
const RPC_URLS: Record<number, string> = {
    1: `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`, // Mainnet
    11155111: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`, // Sepolia
};

// Function to get the provider based on the chain ID
const getProvider = async (): Promise<ethers.JsonRpcProvider> => {
    // Dynamically import ethers and wagmi/chains
    const [{ mainnet, sepolia }] = await Promise.all([import("wagmi/chains")]);

    // Select chain based on environment variable
    const chainId = parseInt(
        process.env.NEXT_PUBLIC_WHATSABI_PROVIDER_CHAIN || "11155111",
    );

    // Find the chain configuration
    const chain = [mainnet, sepolia].find((c) => c.id === chainId) || sepolia;

    // Get the RPC URL for the selected chain
    const rpcUrl = RPC_URLS[chain.id];

    // Create and return the provider
    return new ethers.JsonRpcProvider(rpcUrl);
};

export { getProvider };
