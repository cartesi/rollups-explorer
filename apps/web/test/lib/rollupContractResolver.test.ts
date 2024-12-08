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
import { describe, it } from "vitest";
import RollupContractResolver from "../../src/lib/rollupContractResolver";

const validAddress = "0x60a7048c3136293071605a4eaffef49923e981cc";
const notAnAddress = "0x00";

describe("Rollup Contract Resolver", () => {
    describe("resolver name method", () => {
        it("should return undefined when it is not a rollups-related address", () => {
            expect(
                RollupContractResolver.resolveName(validAddress),
            ).toStrictEqual(undefined);
        });

        it("should return undefined when it is not a valid address", () => {
            expect(
                RollupContractResolver.resolveName(notAnAddress),
            ).toStrictEqual(undefined);
        });

        it("should resolve ether portal address to its readable name", () => {
            const expectedName = "EtherPortal";
            expect(
                RollupContractResolver.resolveName(etherPortalAddress),
            ).toEqual(expectedName);

            expect(
                RollupContractResolver.resolveName(v2EtherPortalAddress),
            ).toEqual(expectedName);
        });

        it("should resolve erc-20 portal address to its readable name", () => {
            const expectedName = "ERC20Portal";
            expect(
                RollupContractResolver.resolveName(erc20PortalAddress),
            ).toEqual(expectedName);
            expect(
                RollupContractResolver.resolveName(v2Erc20PortalAddress),
            ).toEqual(expectedName);
        });

        it("should resolve erc-721 portal address to its readable name", () => {
            const expectedName = "ERC721Portal";
            expect(
                RollupContractResolver.resolveName(erc721PortalAddress),
            ).toEqual(expectedName);
            expect(
                RollupContractResolver.resolveName(v2Erc721PortalAddress),
            ).toEqual(expectedName);
        });

        it("should resolve erc-1155 single portal address to its readable name", () => {
            const expectedName = "ERC1155SinglePortal";
            expect(
                RollupContractResolver.resolveName(erc1155SinglePortalAddress),
            ).toEqual(expectedName);
            expect(
                RollupContractResolver.resolveName(
                    v2Erc1155SinglePortalAddress,
                ),
            ).toEqual(expectedName);
        });

        it("should resolve erc-1155 single portal address to its readable name", () => {
            const expectedName = "ERC1155BatchPortal";
            expect(
                RollupContractResolver.resolveName(erc1155BatchPortalAddress),
            ).toEqual(expectedName);
            expect(
                RollupContractResolver.resolveName(v2Erc1155BatchPortalAddress),
            ).toEqual(expectedName);
        });

        it("should resolve DApp address relay to its readable name", () => {
            const expectedName = "DAppAddressRelay";
            expect(
                RollupContractResolver.resolveName(dAppAddressRelayAddress),
            ).toEqual(expectedName);
        });

        it("should resolve input box address to its readable name", () => {
            const expectedName = "InputBox";
            expect(RollupContractResolver.resolveName(inputBoxAddress)).toEqual(
                expectedName,
            );
            expect(
                RollupContractResolver.resolveName(v2InputBoxAddress),
            ).toEqual(expectedName);
        });
    });

    describe("resolver method name", () => {
        it("should return undefined when it is not a rollups-related address", () => {
            expect(
                RollupContractResolver.resolveMethod(validAddress),
            ).toStrictEqual(undefined);
        });

        it("should return undefined when it is not a valid address", () => {
            expect(
                RollupContractResolver.resolveMethod(notAnAddress),
            ).toStrictEqual(undefined);
        });

        it("should resolve ether portal address to its readable name", () => {
            const expectedValue = "depositEther";
            expect(
                RollupContractResolver.resolveMethod(etherPortalAddress),
            ).toEqual(expectedValue);

            expect(
                RollupContractResolver.resolveMethod(v2EtherPortalAddress),
            ).toEqual(expectedValue);
        });

        it("should resolve erc-20 portal address to its readable name", () => {
            const expectedValue = "depositERC20Tokens";
            expect(
                RollupContractResolver.resolveMethod(erc20PortalAddress),
            ).toEqual(expectedValue);
            expect(
                RollupContractResolver.resolveMethod(v2Erc20PortalAddress),
            ).toEqual(expectedValue);
        });

        it("should resolve erc-721 portal address to its readable name", () => {
            const expectedValue = "depositERC721Tokens";
            expect(
                RollupContractResolver.resolveMethod(erc721PortalAddress),
            ).toEqual(expectedValue);
            expect(
                RollupContractResolver.resolveMethod(v2Erc721PortalAddress),
            ).toEqual(expectedValue);
        });

        it("should resolve erc-1155 single portal address to its readable name", () => {
            const expectedValue = "depositERC1155SingleTokens";
            expect(
                RollupContractResolver.resolveMethod(
                    erc1155SinglePortalAddress,
                ),
            ).toEqual(expectedValue);
            expect(
                RollupContractResolver.resolveMethod(
                    v2Erc1155SinglePortalAddress,
                ),
            ).toEqual(expectedValue);
        });

        it("should resolve erc-1155 single portal address to its readable name", () => {
            const expectedValue = "depositERC1155BatchToken";
            expect(
                RollupContractResolver.resolveMethod(erc1155BatchPortalAddress),
            ).toEqual(expectedValue);
            expect(
                RollupContractResolver.resolveMethod(
                    v2Erc1155BatchPortalAddress,
                ),
            ).toEqual(expectedValue);
        });

        it("should resolve DApp address relay to its readable name", () => {
            const expectedValue = "relayDAppAddress";
            expect(
                RollupContractResolver.resolveMethod(dAppAddressRelayAddress),
            ).toEqual(expectedValue);
        });

        it("should resolve input box address to its readable name", () => {
            const expectedValue = "addInput";
            expect(
                RollupContractResolver.resolveMethod(inputBoxAddress),
            ).toEqual(expectedValue);
            expect(
                RollupContractResolver.resolveMethod(v2InputBoxAddress),
            ).toEqual(expectedValue);
        });
    });
});
