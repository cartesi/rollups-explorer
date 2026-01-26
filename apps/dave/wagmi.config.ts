import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { erc1155Abi, erc20Abi, erc721Abi } from "viem";

type Config = ReturnType<typeof defineConfig>;

const config: Config = defineConfig({
    out: "src/generated/wagmi/index.tsx",
    contracts: [
        {
            name: "erc20",
            abi: erc20Abi,
        },
        {
            name: "erc721",
            abi: erc721Abi,
        },
        {
            abi: erc1155Abi,
            name: "ERC1155",
        },
    ],
    plugins: [react()],
});

export default config;
