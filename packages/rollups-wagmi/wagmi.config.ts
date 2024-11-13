import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";
import { ContractConfig, defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import type { Abi } from "abitype";
import { erc20Abi, erc721Abi } from "viem";
import CartesiApplicationContract from "../../node_modules/@cartesi/rollups-v2/export/artifacts/contracts/dapp/Application.sol/Application.json";
import CartesiDAppContract from "../../node_modules/@cartesi/rollups/export/artifacts/contracts/dapp/CartesiDApp.sol/CartesiDApp.json";
import { erc1155Abi } from "./abi/ERC1155";

/**
 * Uses the sunodo/hardhatDeploy plugin to generate the wagmi config
 * and add a prefix 'v2' to the contract's name making it easy to distinguish between v1 and v2 contracts
 * while also avoiding collisions and making intellisense useful (e.g. useSimulateV2...)
 * @returns
 */
const generateV2ContractsConfig = (): ContractConfig[] => {
    const result = hardhatDeploy({
        directory: "../../node_modules/@cartesi/rollups-v2/export/abi",
    });

    const contracts = (result.contracts?.() ?? []) as ContractConfig[];

    return contracts.map((contract) => ({
        ...contract,
        name: `V2${contract.name}`,
    }));
};

generateV2ContractsConfig();

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

        {
            name: "V2CartesiApplication",
            abi: CartesiApplicationContract.abi as Abi,
        },

        ...generateV2ContractsConfig(),
    ],
    plugins: [
        hardhatDeploy({
            directory: "../../node_modules/@cartesi/rollups/export/abi",
        }),
        react(),
    ],
});
