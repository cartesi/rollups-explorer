import {
    dAppAddressRelayAbi,
    dAppAddressRelayAddress,
    erc1155BatchPortalAbi,
    erc1155BatchPortalAddress,
    erc1155SinglePortalAbi,
    erc1155SinglePortalAddress,
    erc20PortalAbi,
    erc20PortalAddress,
    erc721PortalAbi,
    erc721PortalAddress,
    etherPortalAbi,
    etherPortalAddress,
    inputBoxAbi,
    inputBoxAddress,
    v2Erc1155BatchPortalAbi,
    v2Erc1155BatchPortalAddress,
    v2Erc1155SinglePortalAbi,
    v2Erc1155SinglePortalAddress,
    v2Erc20PortalAbi,
    v2Erc20PortalAddress,
    v2Erc721PortalAbi,
    v2Erc721PortalAddress,
    v2EtherPortalAbi,
    v2EtherPortalAddress,
    v2InputBoxAbi,
    v2InputBoxAddress,
} from "@cartesi/rollups-wagmi";
import { Abi, Hex } from "viem";
import { RollupVersion } from "./interfaces";

type ContractName =
    | "erc20_portal"
    | "ether_portal"
    | "erc1155_single_portal"
    | "erc1155_batch_portal"
    | "erc721_portal"
    | "input_box"
    | "address_relay";

export type Config = { address: Hex; abi: Abi };
type VersionedConfig = Record<RollupVersion, Config>;

type ContractVersionedConfig = {
    [k in ContractName]: VersionedConfig;
};

const rollupContractConfigs: ContractVersionedConfig = {
    erc20_portal: {
        v1: {
            abi: erc20PortalAbi,
            address: erc20PortalAddress,
        },
        v2: {
            abi: v2Erc20PortalAbi,
            address: v2Erc20PortalAddress,
        },
    },
    ether_portal: {
        v1: {
            abi: etherPortalAbi,
            address: etherPortalAddress,
        },
        v2: {
            abi: v2EtherPortalAbi,
            address: v2EtherPortalAddress,
        },
    },
    input_box: {
        v1: {
            abi: inputBoxAbi,
            address: inputBoxAddress,
        },
        v2: {
            abi: v2InputBoxAbi,
            address: v2InputBoxAddress,
        },
    },
    erc1155_single_portal: {
        v1: {
            abi: erc1155SinglePortalAbi,
            address: erc1155SinglePortalAddress,
        },
        v2: {
            abi: v2Erc1155SinglePortalAbi,
            address: v2Erc1155SinglePortalAddress,
        },
    },
    erc1155_batch_portal: {
        v1: {
            abi: erc1155BatchPortalAbi,
            address: erc1155BatchPortalAddress,
        },
        v2: {
            abi: v2Erc1155BatchPortalAbi,
            address: v2Erc1155BatchPortalAddress,
        },
    },
    erc721_portal: {
        v1: {
            abi: erc721PortalAbi,
            address: erc721PortalAddress,
        },
        v2: {
            abi: v2Erc721PortalAbi,
            address: v2Erc721PortalAddress,
        },
    },
    address_relay: {
        v1: {
            abi: dAppAddressRelayAbi,
            address: dAppAddressRelayAddress,
        },
        v2: {
            abi: [],
            address: "0x",
        },
    },
} as const;

class RollupContract {
    private static readonly emptyConfig = { abi: null, address: null };

    public static getERC20PortalConfig(appVersion?: RollupVersion) {
        return RollupContract.getConfig("erc20_portal", appVersion);
    }

    public static getEtherPortalConfig(appVersion?: RollupVersion) {
        return RollupContract.getConfig("ether_portal", appVersion);
    }

    public static getERC721PortalConfig(appVersion?: RollupVersion) {
        return RollupContract.getConfig("erc721_portal", appVersion);
    }

    public static getERC1155SinglePortalConfig(appVersion?: RollupVersion) {
        return RollupContract.getConfig("erc1155_single_portal", appVersion);
    }

    public static getERC1155BatchPortalConfig(appVersion?: RollupVersion) {
        return RollupContract.getConfig("erc1155_batch_portal", appVersion);
    }

    public static getInputBoxConfig(appVersion?: RollupVersion) {
        return RollupContract.getConfig("input_box", appVersion);
    }

    public static getAddressRelayConfig(appVersion?: RollupVersion) {
        return RollupContract.getConfig("address_relay", appVersion);
    }

    private static getConfig(
        contractName: ContractName,
        appVersion?: RollupVersion | null,
    ) {
        if (!appVersion) return structuredClone(RollupContract.emptyConfig);
        return rollupContractConfigs[contractName][appVersion];
    }
}

export default RollupContract;
