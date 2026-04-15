import {
    erc1155BatchPortalAddress,
    erc1155SinglePortalAddress,
    erc20PortalAddress,
    erc721PortalAddress,
    etherPortalAddress,
    inputBoxAddress,
} from "@cartesi/wagmi";
import { type Address, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";
import RollupContractResolver from "../../src/lib/rollupContractResolver";

describe("RollupContractResolver", () => {
    test("resolveName should return the expected names for known portals", () => {
        expect(RollupContractResolver.resolveName(etherPortalAddress)).toBe(
            "EtherPortal",
        );
        expect(RollupContractResolver.resolveName(erc20PortalAddress)).toBe(
            "ERC20Portal",
        );
        expect(RollupContractResolver.resolveName(erc721PortalAddress)).toBe(
            "ERC721Portal",
        );
        expect(
            RollupContractResolver.resolveName(erc1155SinglePortalAddress),
        ).toBe("ERC1155SinglePortal");
        expect(
            RollupContractResolver.resolveName(erc1155BatchPortalAddress),
        ).toBe("ERC1155BatchPortal");
        expect(RollupContractResolver.resolveName(inputBoxAddress)).toBe(
            "InputBox",
        );
    });

    test("resolveMethod should return the expected methods for known portals", () => {
        expect(RollupContractResolver.resolveMethod(etherPortalAddress)).toBe(
            "depositEther",
        );
        expect(RollupContractResolver.resolveMethod(erc20PortalAddress)).toBe(
            "depositERC20Tokens",
        );
        expect(RollupContractResolver.resolveMethod(erc721PortalAddress)).toBe(
            "depositERC721Tokens",
        );
        expect(
            RollupContractResolver.resolveMethod(erc1155SinglePortalAddress),
        ).toBe("depositERC1155SingleTokens");
        expect(
            RollupContractResolver.resolveMethod(erc1155BatchPortalAddress),
        ).toBe("depositERC1155BatchToken");
        expect(RollupContractResolver.resolveMethod(inputBoxAddress)).toBe(
            "addInput",
        );
    });

    test("resolver should return undefined for unknown or invalid addresses", () => {
        expect(RollupContractResolver.resolveName(zeroAddress)).toBeUndefined();
        expect(
            RollupContractResolver.resolveMethod(zeroAddress),
        ).toBeUndefined();
        expect(
            RollupContractResolver.resolveName("invalid" as Address),
        ).toBeUndefined();
        expect(
            RollupContractResolver.resolveMethod("invalid" as Address),
        ).toBeUndefined();
    });
});
