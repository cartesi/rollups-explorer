import { erc1155BatchPortalAbi, erc20Abi } from "@cartesi/rollups-wagmi";
import { describe, it } from "vitest";
import { decodePayload } from "../../../src/components/specification/decoder";
import { systemSpecification } from "../../../src/components/specification/systemSpecs";
import { Specification } from "../../../src/components/specification/types";
import { encodedDataSamples } from "./encodedData.stubs";

const inputData =
    "0x24d15c67000000000000000000000000f08b9b4044441e43337c1ab6e941c4e59d5f73c80000000000000000000000004ca2f6935200b9a782a78f408f640f17b29809d800000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
const singleERC1155DepositPayload =
    "0x2960f4db2b0993ae5b59bc4a0f5ec7a1767e905ea074683b5be015f053b5dceb064c41fc9d11b6e5000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

const batchPayload =
    "0x2960f4db2b0993ae5b59bc4a0f5ec7a1767e905ea074683b5be015f053b5dceb064c41fc9d11b6e5000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000000000003200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

describe("Decoding Specification", () => {
    it("should throw an error for non-supported specification mode", () => {
        try {
            // @ts-ignore
            decodePayload({ mode: "random" }, batchPayload);
            expect("Should never enter here").toEqual("");
        } catch (error: any) {
            expect(error.message).toEqual(
                "Supported Specification modes: [json_abi, abi_params] - but found random",
            );
        }
    });

    describe("For JSON ABI", () => {
        it("should decode data based on full JSON ABI", () => {
            const spec: Specification = {
                mode: "json_abi",
                name: "erc1155BatchPortalAbi",
                abi: erc1155BatchPortalAbi,
            };

            const envelope = decodePayload(spec, inputData);

            expect(envelope.error).not.toBeDefined();
            expect(envelope.result).toEqual({
                functionName: "depositBatchERC1155Token",
                args: [
                    "0xf08B9B4044441e43337c1AB6e941c4e59d5F73c8",
                    "0x4cA2f6935200b9a782A78f408F640F17B29809d8",
                    [0n, 1n, 2n],
                    [50n, 40n, 30n],
                    "0x",
                    "0x",
                ],
                orderedNamedArgs: [
                    ["_token", "0xf08B9B4044441e43337c1AB6e941c4e59d5F73c8"],
                    ["_dapp", "0x4cA2f6935200b9a782A78f408F640F17B29809d8"],
                    ["_tokenIds", [0n, 1n, 2n]],
                    ["_values", [50n, 40n, 30n]],
                    ["_baseLayerData", "0x"],
                    ["_execLayerData", "0x"],
                ],
            });
        });

        it("should return error when 4-byte signature is not found in the ABI", () => {
            const spec: Specification = {
                mode: "json_abi",
                name: "erc1155BatchPortalAbi",
                abi: erc20Abi,
            };

            const envelope = decodePayload(spec, inputData);

            expect(envelope.error).toBeDefined();
            expect(envelope.error?.message).toEqual(
                `Encoded function signature "0x24d15c67" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.
You can look up the signature here: https://openchain.xyz/signatures?query=0x24d15c67.`,
            );
            expect(envelope.result).toEqual({});
        });
    });

    describe("For ABI Params", () => {
        it("should parse encoded data with human-readable ABI format", () => {
            const spec: Specification = {
                mode: "abi_params",
                abiParams: ["string name, uint amount, bool success"],
                name: "Wagmi Encoded Data",
            };

            const envelope = decodePayload(
                spec,
                encodedDataSamples.wagmiSample,
            );

            expect(envelope.error).not.toBeDefined();
            expect(envelope.result).toEqual({
                name: "wagmi",
                amount: 420n,
                success: true,
            });
        });

        it("should decode non-standard encoded data based on slice instruction", () => {
            const spec: Specification = {
                mode: "abi_params",
                name: "Single ERC-1155 Deposit",
                sliceInstructions: [
                    { from: 0, to: 20, name: "tokenAddress" },
                    { from: 20, to: 40, name: "from" },
                    { from: 40, to: 72, name: "tokenId", type: "uint" },
                    { from: 72, to: 104, name: "amount", type: "uint" },
                ],
                abiParams: [],
            };

            const envelope = decodePayload(spec, singleERC1155DepositPayload);

            expect(envelope.error).not.toBeDefined();
            expect(envelope.result).toEqual({
                tokenAddress: "0x2960f4db2b0993ae5b59bc4a0f5ec7a1767e905e",
                from: "0xa074683b5be015f053b5dceb064c41fc9d11b6e5",
                tokenId: 2n,
                amount: 100n,
            });
        });

        it("should return type error when parsing non-standard encoded data given insufficient size", () => {
            const spec: Specification = {
                mode: "abi_params",
                name: "Single ERC-1155 Deposit",
                sliceInstructions: [
                    { from: 0, to: 20, name: "willThrow", type: "address" },
                    { from: 20, to: 40, name: "from" },
                    { from: 40, to: 72, name: "tokenId", type: "uint" },
                    { from: 72, to: 104, name: "amount", type: "uint" },
                ],
                abiParams: [],
            };

            const envelope = decodePayload(spec, singleERC1155DepositPayload);

            expect(envelope.error).toBeDefined();
            expect(envelope.error?.message).toEqual(
                "Data size of 20 bytes is too small for given parameters.\n\nParams: (address willThrow)\nData:   0x2960f4db2b0993ae5b59bc4a0f5ec7a1767e905e (20 bytes)",
            );
        });

        it("should decode based on data slice instructions targeting a more complex sliced data.", () => {
            const spec: Specification = {
                mode: "abi_params",
                name: "1155 Batch Portal Deposit",
                abiParams: [
                    "uint[] tokenIds, uint[] amount, bytes baseLayer, bytes execLayer",
                ],
                sliceInstructions: [
                    {
                        from: 0,
                        to: 20,
                        name: "tokenAddress",
                    },
                    {
                        from: 20,
                        to: 40,
                        name: "from",
                    },
                    {
                        from: 40,
                        name: "data",
                    },
                ],
                sliceTarget: "data",
            };

            const envelope = decodePayload(spec, batchPayload);

            expect(envelope.result).toEqual({
                amount: [200n, 50n],
                baseLayer: "0x",
                execLayer: "0x",
                from: "0xa074683b5be015f053b5dceb064c41fc9d11b6e5",
                tokenAddress: "0x2960f4db2b0993ae5b59bc4a0f5ec7a1767e905e",
                tokenIds: [2n, 1n],
            });
        });

        it("should return an error when slice target is wrongly set", () => {
            const spec: Specification = {
                mode: "abi_params",
                name: "1155 Batch Portal Deposit",
                abiParams: [
                    "uint[] tokenIds, uint[] amount, bytes baseLayer, bytes execLayer",
                ],
                sliceInstructions: [
                    {
                        from: 0,
                        to: 20,
                        name: "tokenAddress",
                    },
                    {
                        from: 20,
                        to: 40,
                        name: "from",
                    },
                    {
                        from: 40,
                        name: "data",
                    },
                ],
                sliceTarget: "from",
            };

            const envelope = decodePayload(spec, batchPayload);

            expect(envelope.error).toBeDefined();
            expect(envelope.error?.message).toEqual(
                `Data size of 20 bytes is too small for given parameters.

Params: (uint256[] tokenIds, uint256[] amount, bytes baseLayer, bytes execLayer)
Data:   0xa074683b5be015f053b5dceb064c41fc9d11b6e5 (20 bytes)
Slice name: "from" (Is it the right one?)`,
            );
        });

        describe("Portal cases", () => {
            it("should decode ether-portal data without the exec-layer information", () => {
                const envelope = decodePayload(
                    systemSpecification.EtherPortalSpec,
                    encodedDataSamples.etherPortalSampleWithoutExecLayer,
                );

                expect(envelope.result).toEqual({
                    amount: 10000000000000000n,
                    sender: "0x0c70e9a737aa92055c8c1217bf887a65cb2292f4",
                });
            });
        });

        describe("Struct definition example cases", () => {
            it("should support setting a separate struct definition to decode abi-encoded data", () => {
                const spec: Specification = {
                    mode: "abi_params",
                    abiParams: [
                        "Baz baz, uint amount, uint tokenIndex",
                        "struct Baz {uint256 allowance; bool success; address operator;}",
                    ],
                    name: "Separate struct definition",
                };

                const envelope = decodePayload(
                    spec,
                    encodedDataSamples.encodedDataSampleWithStruct,
                );

                expect(envelope.error).not.toBeDefined();
                expect(envelope.result).toEqual({
                    amount: 1000n,
                    tokenIndex: 2n,
                    baz: {
                        allowance: 10n,
                        operator: "0x028367fE226CD9E5699f4288d512fE3a4a4a0012",
                        success: false,
                    },
                });
            });

            it("should support setting inline struct definition to decode abi-encoded data", () => {
                const spec: Specification = {
                    mode: "abi_params",
                    abiParams: [
                        "(uint256 allowance, bool success, address operator) foo, uint amount, uint id",
                    ],
                    name: "Inline struct definition",
                };

                const envelope = decodePayload(
                    spec,
                    encodedDataSamples.encodedDataSampleWithStruct,
                );

                expect(envelope.error).not.toBeDefined();
                expect(envelope.result).toEqual({
                    amount: 1000n,
                    id: 2n,
                    foo: {
                        allowance: 10n,
                        operator: "0x028367fE226CD9E5699f4288d512fE3a4a4a0012",
                        success: false,
                    },
                });
            });
        });
    });
});
