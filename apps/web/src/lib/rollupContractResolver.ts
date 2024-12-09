import {
    dAppAddressRelayAddress,
    erc1155BatchPortalAddress,
    erc1155SinglePortalAddress,
    erc20PortalAddress,
    erc721PortalAddress,
    etherPortalAddress,
    inputBoxAddress,
    v2Erc1155BatchPortalAddress,
    v2Erc1155SinglePortalAddress,
    v2Erc20PortalAddress,
    v2Erc721PortalAddress,
    v2EtherPortalAddress,
    v2InputBoxAddress,
} from "@cartesi/rollups-wagmi";
import { T, cond } from "ramda";
import { Address, getAddress, isAddress } from "viem";

export type Resolver = (
    contractAddress: Address,
) => { name: string; method: string } | undefined;

const etherPortalAddresses: Address[] = [
    etherPortalAddress,
    v2EtherPortalAddress,
];
const erc20PortalAddresses: Address[] = [
    erc20PortalAddress,
    v2Erc20PortalAddress,
];
const erc721PortalAddresses: Address[] = [
    erc721PortalAddress,
    v2Erc721PortalAddress,
];
const erc1155BatchPortalAddresses: Address[] = [
    erc1155BatchPortalAddress,
    v2Erc1155BatchPortalAddress,
];
const erc1155SinglePortalAddresses: Address[] = [
    erc1155SinglePortalAddress,
    v2Erc1155SinglePortalAddress,
];
const inputBoxAddresses: Address[] = [inputBoxAddress, v2InputBoxAddress];

const isOneOf = (portalAddresses: Address[]) => (address: Address) =>
    portalAddresses.includes(address);

const resolver: Resolver = cond([
    [
        isOneOf(etherPortalAddresses),
        () => ({ name: "EtherPortal", method: "depositEther" }),
    ],
    [
        isOneOf(erc20PortalAddresses),
        () => ({ name: "ERC20Portal", method: "depositERC20Tokens" }),
    ],
    [
        isOneOf(erc721PortalAddresses),
        () => ({ name: "ERC721Portal", method: "depositERC721Tokens" }),
    ],
    [
        isOneOf(erc1155SinglePortalAddresses),
        () => ({
            name: "ERC1155SinglePortal",
            method: "depositERC1155SingleTokens",
        }),
    ],
    [
        isOneOf(erc1155BatchPortalAddresses),
        () => ({
            name: "ERC1155BatchPortal",
            method: "depositERC1155BatchToken",
        }),
    ],
    [
        isOneOf([dAppAddressRelayAddress]),
        () => ({ name: "DAppAddressRelay", method: "relayDAppAddress" }),
    ],
    [
        isOneOf(inputBoxAddresses),
        () => ({ name: "InputBox", method: "addInput" }),
    ],
    [T, () => undefined],
]);

export default class RollupContractResolver {
    static resolveName(contractAddress: Address) {
        if (!isAddress(contractAddress)) return undefined;
        const result = resolver(getAddress(contractAddress));
        return result?.name;
    }

    static resolveMethod(contractAddress: Address) {
        if (!isAddress(contractAddress)) return undefined;
        const result = resolver(getAddress(contractAddress));
        return result?.method;
    }
}
