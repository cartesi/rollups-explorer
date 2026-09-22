import {
    erc1155BatchPortalAddress,
    erc1155SinglePortalAddress,
    erc20PortalAddress,
    erc721PortalAddress,
    etherPortalAddress,
    inputBoxAddress,
} from "@cartesi/react";
import { T, cond } from "ramda";
import { type Address, getAddress, isAddress } from "viem";

export type Resolver = (
    contractAddress: Address,
) => { name: string; method: string } | undefined;

const etherPortalAddresses: Address[] = [etherPortalAddress];
const erc20PortalAddresses: Address[] = [erc20PortalAddress];
const erc721PortalAddresses: Address[] = [erc721PortalAddress];
const erc1155BatchPortalAddresses: Address[] = [erc1155BatchPortalAddress];
const erc1155SinglePortalAddresses: Address[] = [erc1155SinglePortalAddress];
const inputBoxAddresses: Address[] = [inputBoxAddress];

const isOneOf = (portalAddresses: Address[]) => (address: Address) =>
    portalAddresses.includes(address);

const resolver: Resolver = cond([
    [
        isOneOf(etherPortalAddresses),
        () => ({ name: "EtherPortal", method: "depositEther" }),
    ],
    [
        isOneOf(erc20PortalAddresses),
        () => ({ name: "ERC20Portal", method: "depositErc20Tokens" }),
    ],
    [
        isOneOf(erc721PortalAddresses),
        () => ({ name: "ERC721Portal", method: "depositErc721Token" }),
    ],
    [
        isOneOf(erc1155SinglePortalAddresses),
        () => ({
            name: "ERC1155SinglePortal",
            method: "depositSingleErc1155Token",
        }),
    ],
    [
        isOneOf(erc1155BatchPortalAddresses),
        () => ({
            name: "ERC1155BatchPortal",
            method: "depositBatchErc1155Token",
        }),
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
