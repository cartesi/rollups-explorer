import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";
import { defineConfig } from "@wagmi/cli";
import type { Abi } from "abitype";
import { erc20Abi, erc721Abi } from "viem";
import { react } from "@wagmi/cli/plugins";
import CartesiDAppContract from "../../node_modules/@cartesi/rollups/export/artifacts/contracts/dapp/CartesiDApp.sol/CartesiDApp.json";

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
    ],
    plugins: [
        hardhatDeploy({
            directory: "../../node_modules/@cartesi/rollups/export/abi",
        }),
        react(),
    ],
});
