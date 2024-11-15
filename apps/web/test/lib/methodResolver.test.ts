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
import { describe, it } from "vitest";
import { InputItemFragment } from "../../src/graphql/explorer/operations";
import { RollupVersion } from "../../src/graphql/explorer/types";
import { methodResolver } from "../../src/lib/methodResolver";

const defaultInput: InputItemFragment = {
    id: "0x60a7048c3136293071605a4eaffef49923e981cc-40",
    application: {
        address: "0x60a7048c3136293071605a4eaffef49923e981cc",
        rollupVersion: RollupVersion.V1,
        id: "0x60a7048c3136293071605a4eaffef49923e981cc",
        __typename: "Application",
    },
    chain: {
        id: "11155111",
    },
    index: 40,
    payload: "0x123444fff0",
    msgSender: "0x8fd78976f8955d13baa4fc99043208f4ec020d7e",
    timestamp: "1710358644",
    transactionHash:
        "0x65d611065907cc7dd92ae47378427ed99e1cfe17bd6285b85f868ae7b70ed62f",
    erc20Deposit: null,
    __typename: "Input",
};

describe("methodResolver", () => {
    it("should resolve correct method name", () => {
        let method = methodResolver(defaultInput);

        expect(method).toBe(undefined);

        method = methodResolver({
            ...defaultInput,
            msgSender: etherPortalAddress,
        });

        expect(method).toBe("depositEther");

        expect(
            methodResolver({
                ...defaultInput,
                msgSender: v2EtherPortalAddress,
            }),
        ).toEqual("depositEther");

        method = methodResolver({
            ...defaultInput,
            msgSender: erc721PortalAddress,
        });

        expect(method).toBe("depositERC721Tokens");

        expect(
            methodResolver({
                ...defaultInput,
                msgSender: v2Erc721PortalAddress,
            }),
        ).toEqual("depositERC721Tokens");

        method = methodResolver({
            ...defaultInput,
            msgSender: erc20PortalAddress,
        });

        expect(method).toBe("depositERC20Tokens");

        expect(
            methodResolver({
                ...defaultInput,
                msgSender: v2Erc20PortalAddress,
            }),
        ).toEqual("depositERC20Tokens");

        method = methodResolver({
            ...defaultInput,
            msgSender: erc1155SinglePortalAddress,
        });

        expect(method).toBe("depositERC1155SingleTokens");

        expect(
            methodResolver({
                ...defaultInput,
                msgSender: v2Erc1155SinglePortalAddress,
            }),
        ).toEqual("depositERC1155SingleTokens");

        method = methodResolver({
            ...defaultInput,
            msgSender: erc1155BatchPortalAddress,
        });

        expect(method).toBe("depositERC1155BatchTokens");

        expect(
            methodResolver({
                ...defaultInput,
                msgSender: v2Erc1155BatchPortalAddress,
            }),
        ).toEqual("depositERC1155BatchTokens");

        method = methodResolver({
            ...defaultInput,
            msgSender: dAppAddressRelayAddress,
        });

        expect(method).toEqual("relayDAppAddress");
    });
});
