import { Hex } from "viem";
import { describe, it } from "vitest";
import { findSpecificationFor } from "../../../src/components/specification/conditionals";
import { decodePayload } from "../../../src/components/specification/decoder";
import { systemSpecificationAsList } from "../../../src/components/specification/systemSpecs";
import {
    AbiParamsSpecification,
    Specification,
} from "../../../src/components/specification/types";
import { encodedDataSamples } from "./encodedData.stubs";
import { inputResponses } from "./stubs";

describe("Specification Conditionals", () => {
    it("should return null when inputs does not match conditional criteria on existing specifications", () => {
        const { nonPortalRelatedInput } = inputResponses;
        const specification = findSpecificationFor(
            nonPortalRelatedInput,
            systemSpecificationAsList,
        );

        expect(specification).toBeNull();
    });

    describe("Matching by msgSender for Portals (System Specifications)", () => {
        it("should match msgSender and return decoding specification for ERC-20 Portal", () => {
            const { erc20DepositInput } = inputResponses;
            const specification = findSpecificationFor(
                erc20DepositInput,
                systemSpecificationAsList,
            );

            expect(specification).not.toBeNull();
            expect(specification?.name).toEqual(
                "ERC-20 Portal @cartesi/rollups@1.x",
            );
        });

        it("should match msgSender and return decoding specification for ERC-1155 Single Portal", () => {
            const { singleERC1155DepositInput } = inputResponses;
            const specification = findSpecificationFor(
                singleERC1155DepositInput,
                systemSpecificationAsList,
            );

            expect(specification).not.toBeNull();
            expect(specification?.name).toEqual(
                "ERC-1155 Single Portal @cartesi/rollups@1.x",
            );
        });

        it("should match msgSender and return decoding specification for ERC-1155 Batch Portal", () => {
            const { batchERC1155DepositInput } = inputResponses;
            const specification = findSpecificationFor(
                batchERC1155DepositInput,
                systemSpecificationAsList,
            ) as AbiParamsSpecification;

            expect(specification).not.toBeNull();
            expect(specification?.name).toEqual(
                "ERC-1155 Batch Portal @cartesi/rollups@1.x",
            );
            expect(specification?.mode).toEqual("abi_params");
            expect(specification.sliceTarget).toEqual("data");
            expect(specification.sliceInstructions).toHaveLength(3);

            expect(
                decodePayload(specification, batchERC1155DepositInput.payload)
                    .result,
            ).toEqual({
                tokenAddress: "0xf08b9b4044441e43337c1ab6e941c4e59d5f73c8",
                from: "0xa074683b5be015f053b5dceb064c41fc9d11b6e5",
                amounts: [50n, 40n, 30n],
                tokenIds: [0n, 1n, 2n],
                baseLayer: "0x",
                execLayer: "0x",
            });
        });

        it("should match msgSender and return decoding specification for ERC-721 Portal", () => {
            const { erc721DepositInput } = inputResponses;
            const specification = findSpecificationFor(
                erc721DepositInput,
                systemSpecificationAsList,
            ) as AbiParamsSpecification;

            expect(specification).not.toBeNull();
            expect(specification.name).toEqual(
                "ERC-721 Portal @cartesi/rollups@1.x",
            );
            expect(specification.mode).toEqual("abi_params");
            expect(specification.sliceInstructions).toHaveLength(3);

            expect(
                decodePayload(specification, erc721DepositInput.payload).result,
            ).toEqual({
                from: "0xa074683b5be015f053b5dceb064c41fc9d11b6e5",
                tokenAddress: "0x7a3cc9c0408887a030a0354330c36a9cd681aa7e",
                tokenIndex: 3n,
            });
        });
    });

    describe("Matching by msgSender for Relays (System Specifications)", () => {
        it("should match msgSender and return decoding specification for DApp Address Relay", () => {
            const { dappAddressRelayInput } = inputResponses;
            const specification = findSpecificationFor(
                dappAddressRelayInput,
                systemSpecificationAsList,
            );

            expect(specification).not.toBeNull();
            expect(specification?.name).toEqual(
                "DApp Address Relay @cartesi/rollups@1.x",
            );
        });
    });

    describe("Matching by old application.id (Retrocompatibility)", () => {
        it("should return specification when defined old application.id is used", () => {
            const dummyInput = {
                application: { address: "my-app-hex-address" },
                payload: encodedDataSamples.wagmiSample,
            };
            const spec: Specification = {
                mode: "abi_params",
                abiParams: ["string name, uint amount, bool success"],
                name: "Conditional Test by application.id",
                conditionals: [
                    {
                        logicalOperator: "or",
                        conditions: [
                            {
                                // @ts-ignore
                                field: "application.id",
                                operator: "equals",
                                value: "my-app-hex-address",
                            },
                        ],
                    },
                ],
            };
            // lets add all the system-specs first and our custom last.
            const specifications = [...systemSpecificationAsList, spec];
            const specification = findSpecificationFor(
                dummyInput,
                specifications,
            );

            expect(specification).not.toBeNull();
            expect(specification?.name).toEqual(
                "Conditional Test by application.id",
            );

            expect(
                decodePayload(specification!, dummyInput.payload as Hex).result,
            ).toEqual({
                amount: 420n,
                name: "wagmi",
                success: true,
            });
        });

        it("should return specification when multiple conditions match", () => {
            const input = {
                msgSender: "an-address-to-match-here",
                application: { address: "my-app-address" },
            };

            const spec: Specification = {
                mode: "abi_params",
                abiParams: ["string name, uint amount, bool success"],
                name: "Conditional Test match both conditions",
                conditionals: [
                    {
                        logicalOperator: "and",
                        conditions: [
                            {
                                // @ts-ignore
                                field: "application.id",
                                operator: "equals",
                                value: "my-app-address",
                            },
                            {
                                field: "msgSender",
                                operator: "equals",
                                value: "an-address-to-match-here",
                            },
                        ],
                    },
                ],
            };

            const specification = findSpecificationFor(input, [
                ...systemSpecificationAsList,
                spec,
            ]);

            expect(specification).not.toBeNull();
            expect(specification?.name).toEqual(
                "Conditional Test match both conditions",
            );
        });
    });

    describe("Matching by application.address", () => {
        it("should return specification when application.id match input information", () => {
            const dummyInput = {
                application: { address: "my-app-hex-address" },
                payload: encodedDataSamples.wagmiSample,
            };
            const spec: Specification = {
                mode: "abi_params",
                abiParams: ["string name, uint amount, bool success"],
                name: "Conditional Test by application.id",
                conditionals: [
                    {
                        logicalOperator: "or",
                        conditions: [
                            {
                                field: "application.address",
                                operator: "equals",
                                value: "my-app-hex-address",
                            },
                        ],
                    },
                ],
            };
            // lets add all the system-specs first and our custom last.
            const specifications = [...systemSpecificationAsList, spec];
            const specification = findSpecificationFor(
                dummyInput,
                specifications,
            );

            expect(specification).not.toBeNull();
            expect(specification?.name).toEqual(
                "Conditional Test by application.id",
            );

            expect(
                decodePayload(specification!, dummyInput.payload as Hex).result,
            ).toEqual({
                amount: 420n,
                name: "wagmi",
                success: true,
            });
        });
    });

    describe("Matching multiple conditions with 'and' operator", () => {
        it("should return specification when both conditions match", () => {
            const input = {
                msgSender: "an-address-to-match-here",
                application: { address: "my-app-address" },
            };

            const spec: Specification = {
                mode: "abi_params",
                abiParams: ["string name, uint amount, bool success"],
                name: "Conditional Test match both conditions",
                conditionals: [
                    {
                        logicalOperator: "and",
                        conditions: [
                            {
                                field: "application.address",
                                operator: "equals",
                                value: "my-app-address",
                            },
                            {
                                field: "msgSender",
                                operator: "equals",
                                value: "an-address-to-match-here",
                            },
                        ],
                    },
                ],
            };

            const specification = findSpecificationFor(input, [
                ...systemSpecificationAsList,
                spec,
            ]);

            expect(specification).not.toBeNull();
            expect(specification?.name).toEqual(
                "Conditional Test match both conditions",
            );
        });

        it("should not return specification when one condition does not match", () => {
            const input = {
                msgSender: "the-not-matching-address",
                application: { address: "my-app-address" },
                payload: encodedDataSamples.wagmiSample,
            };

            const spec: Specification = {
                mode: "abi_params",
                abiParams: ["string name, uint amount, bool success"],
                name: "Conditional Test match both conditions",
                conditionals: [
                    {
                        logicalOperator: "and",
                        conditions: [
                            {
                                field: "application.address",
                                operator: "equals",
                                value: "my-app-address",
                            },
                            {
                                field: "msgSender",
                                operator: "equals",
                                value: "an-address-to-match-here",
                            },
                        ],
                    },
                ],
            };

            const specification = findSpecificationFor(input, [
                ...systemSpecificationAsList,
                spec,
            ]);

            expect(specification).toBeNull();
        });
    });

    describe("Matching multiple conditions with 'or' operator", () => {
        it("should return specification when at least one condition match", () => {
            const input = {
                msgSender: "that-will-not-match",
                application: { address: "but-the-app-address-will" },
                payload: encodedDataSamples.wagmiSample,
            };

            const spec: Specification = {
                mode: "abi_params",
                abiParams: ["string name, uint amount, bool success"],
                name: "Conditional Test at least one match",
                conditionals: [
                    {
                        logicalOperator: "or",
                        conditions: [
                            {
                                field: "msgSender",
                                operator: "equals",
                                value: "expected-msg-sender",
                            },
                            {
                                field: "application.address",
                                operator: "equals",
                                value: "but-the-app-address-will",
                            },
                        ],
                    },
                ],
            };

            const specification = findSpecificationFor(input, [
                ...systemSpecificationAsList,
                spec,
            ]);

            expect(specification).not.toBeNull();
            expect(specification?.name).toEqual(
                "Conditional Test at least one match",
            );
        });

        it("should return specification when both conditions match", () => {
            const input = {
                msgSender: "msg-sender-address",
                application: { address: "cartesi-app-address" },
            };

            const spec: Specification = {
                mode: "abi_params",
                abiParams: [],
                name: "Conditional Test match both conditions",
                conditionals: [
                    {
                        logicalOperator: "or",
                        conditions: [
                            {
                                field: "application.address",
                                operator: "equals",
                                value: "cartesi-app-address",
                            },
                            {
                                field: "msgSender",
                                operator: "equals",
                                value: "msg-sender-address",
                            },
                        ],
                    },
                ],
            };

            const specification = findSpecificationFor(input, [
                ...systemSpecificationAsList,
                spec,
            ]);

            expect(specification).not.toBeNull();
            expect(specification?.name).toEqual(
                "Conditional Test match both conditions",
            );
        });
    });
});
