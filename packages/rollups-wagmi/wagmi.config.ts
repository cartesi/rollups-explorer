import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";
import { defineConfig } from "@wagmi/cli";
import type { Abi } from "abitype";
import { erc, react } from "@wagmi/cli/plugins";
import CartesiDAppContract from "../../node_modules/@cartesi/rollups/export/artifacts/contracts/dapp/CartesiDApp.sol/CartesiDApp.json";

export default defineConfig({
    out: "src/index.tsx",
    contracts: [
        {
            name: "CartesiDApp",
            abi: CartesiDAppContract.abi as Abi,
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
