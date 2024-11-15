"use client";
import {
    dAppAddressRelayAddress,
    erc1155BatchPortalAddress,
    erc1155SinglePortalAddress,
    erc20PortalAddress,
    erc721PortalAddress,
    etherPortalAddress,
    v2Erc1155BatchPortalAddress,
    v2Erc1155SinglePortalAddress,
    v2Erc20PortalAddress,
    v2Erc721PortalAddress,
    v2EtherPortalAddress,
} from "@cartesi/rollups-wagmi";
import { Address, getAddress } from "viem";
import { InputItemFragment } from "../graphql/explorer/operations";

export type MethodResolver = (
    input: InputItemFragment,
) => string | undefined | false;

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

const etherDepositResolver: MethodResolver = (input) =>
    etherPortalAddresses.includes(getAddress(input.msgSender)) &&
    "depositEther";

const erc20PortalResolver: MethodResolver = (input) =>
    erc20PortalAddresses.includes(getAddress(input.msgSender)) &&
    "depositERC20Tokens";

const erc721PortalResolver: MethodResolver = (input) =>
    erc721PortalAddresses.includes(getAddress(input.msgSender)) &&
    "depositERC721Tokens";

const erc1155SinglePortalResolver: MethodResolver = (input) =>
    erc1155SinglePortalAddresses.includes(getAddress(input.msgSender)) &&
    "depositERC1155SingleTokens";

const erc1155BatchPortalResolver: MethodResolver = (input) =>
    erc1155BatchPortalAddresses.includes(getAddress(input.msgSender)) &&
    "depositERC1155BatchTokens";

const dAppAddressRelayResolver: MethodResolver = (input) =>
    getAddress(input.msgSender) === dAppAddressRelayAddress &&
    "relayDAppAddress";

const resolvers: MethodResolver[] = [
    etherDepositResolver,
    erc20PortalResolver,
    erc721PortalResolver,
    erc1155SinglePortalResolver,
    erc1155BatchPortalResolver,
    dAppAddressRelayResolver,
];

export const methodResolver: MethodResolver = (input) => {
    for (const resolver of resolvers) {
        const method = resolver(input);
        if (method) return method;
    }
    return undefined;
};
