import { describe, it } from "vitest";
import {
    erc1155BatchPortalAddress,
    erc1155SinglePortalAddress,
    erc20PortalAddress,
    erc721PortalAddress,
    etherPortalAddress,
} from "@cartesi/rollups-wagmi";
import { methodResolver } from "../../src/lib/methodResolver";
import { InputItemFragment } from "../../src/graphql/explorer/operations";

const defaultInput: InputItemFragment = {
    id: "0x60a7048c3136293071605a4eaffef49923e981cc-40",
    application: {
        id: "0x60a7048c3136293071605a4eaffef49923e981cc",
        __typename: "Application",
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
    it("should resolve correct method", () => {
        let method = methodResolver(defaultInput);

        expect(method).toBe(undefined);

        method = methodResolver({
            ...defaultInput,
            msgSender: etherPortalAddress,
        });

        expect(method).toBe("depositEther");

        method = methodResolver({
            ...defaultInput,
            msgSender: erc721PortalAddress,
        });

        expect(method).toBe("depositERC721Tokens");

        method = methodResolver({
            ...defaultInput,
            msgSender: erc20PortalAddress,
        });

        expect(method).toBe("depositERC20Tokens");

        method = methodResolver({
            ...defaultInput,
            msgSender: erc1155SinglePortalAddress,
        });

        expect(method).toBe("depositERC1155SingleTokens");

        method = methodResolver({
            ...defaultInput,
            msgSender: erc1155BatchPortalAddress,
        });

        expect(method).toBe("depositERC1155BatchTokens");
    });
});
