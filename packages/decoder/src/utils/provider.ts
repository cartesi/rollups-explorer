import { ethers } from "ethers";
export const provider = process.env.NEXT_PUBLIC_EXPLORER_API_URL
    ? new ethers.AlchemyProvider(process.env.NEXT_PUBLIC_ALCHEMY_API_KEY)
    : ethers.getDefaultProvider("sepolia");

// @todo make list of networks
