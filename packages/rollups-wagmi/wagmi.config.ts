import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";
import { defineConfig } from "@wagmi/cli";
import { erc, react } from "@wagmi/cli/plugins";
import type { Abi } from "abitype";
import CartesiDAppContract from "../../node_modules/@cartesi/rollups/export/artifacts/contracts/dapp/CartesiDApp.sol/CartesiDApp.json";
import { erc1155Abi } from "./abi/ERC1155";

export default defineConfig({
    out: "src/index.tsx",
    contracts: [
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
        erc(),
        react(),
    ],
});
