import { describe, it } from "vitest";
import { findSpecificationFor } from "../../../src/components/specification/conditionals";
import { decodePayload } from "../../../src/components/specification/decoder";
import { systemSpecificationAsList } from "../../../src/components/specification/systemSpecs";
import { AbiParamsSpecification } from "../../../src/components/specification/types";
import { inputResponses } from "./stubs";

describe("Specification Conditionals", () => {
    describe("Matching by msgSender for Portals (System Specifications)", () => {
        it("should match msgSender and return decoding specification for ERC-20 Portal", () => {
            const { erc20DepositInput } = inputResponses;
            const specification = findSpecificationFor(
                erc20DepositInput,
                systemSpecificationAsList,
            );

            expect(specification).toBeDefined();
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

            expect(specification).toBeDefined();
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

            expect(specification).toBeDefined();
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

            expect(specification).toBeDefined();
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
});
