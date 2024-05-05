"use client";
import {
    erc1155BatchPortalAddress,
    erc1155SinglePortalAddress,
    erc20PortalAddress,
    erc721PortalAddress,
    etherPortalAddress,
} from "@cartesi/rollups-wagmi";
import { getAddress } from "viem";
import { InputItemFragment } from "../graphql/explorer/operations";

export type MethodResolver = (
    input: InputItemFragment,
) => string | undefined | false;

const etherDepositResolver: MethodResolver = (input) =>
    getAddress(input.msgSender) === etherPortalAddress && "depositEther";

const erc20PortalResolver: MethodResolver = (input) =>
    getAddress(input.msgSender) === erc20PortalAddress && "depositERC20Tokens";

const erc721PortalResolver: MethodResolver = (input) =>
    getAddress(input.msgSender) === erc721PortalAddress &&
    "depositERC721Tokens";

const erc1155SinglePortalResolver: MethodResolver = (input) =>
    getAddress(input.msgSender) === erc1155SinglePortalAddress &&
    "depositERC1155SingleTokens";

const erc1155BatchPortalResolver: MethodResolver = (input) =>
    getAddress(input.msgSender) === erc1155BatchPortalAddress &&
    "depositERC1155BatchTokens";

const resolvers: MethodResolver[] = [
    etherDepositResolver,
    erc20PortalResolver,
    erc721PortalResolver,
    erc1155SinglePortalResolver,
    erc1155BatchPortalResolver,
];

export const methodResolver: MethodResolver = (input) => {
    for (const resolver of resolvers) {
        const method = resolver(input);
        if (method) return method;
    }
    return undefined;
};
