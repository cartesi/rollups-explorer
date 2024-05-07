import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";
import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import type { Abi } from "abitype";
import { erc20Abi, erc721Abi } from "viem";
import CartesiDAppContract from "../../node_modules/@cartesi/rollups/export/artifacts/contracts/dapp/CartesiDApp.sol/CartesiDApp.json";
import { erc1155Abi } from "./abi/ERC1155";

export default defineConfig({
    out: "src/index.tsx",
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
            name: "CartesiDApp",
            abi: CartesiDAppContract.abi as Abi,
        },
        {
            abi: erc1155Abi,
            name: "ERC1155",
        },
    ],
    plugins: [
        hardhatDeploy({
            directory: "../../node_modules/@cartesi/rollups/export/abi",
        }),
        react(),
    ],
});
