import {
    decodeAbiParameters,
    encodeAbiParameters,
    parseAbiParameters,
} from "viem";
import { describe, expect, it } from "vitest";
import type { AbiInputParam } from "../../../../src/components/transactions/GenericInputForm/types";
import {
    encodeFunctionParam,
    generateEmptyValue,
    generateFinalValues,
    generateInitialValues,
    parseArrayType,
} from "../../../../src/components/transactions/GenericInputForm/utils";

const addressA = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const addressB = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

describe("GenericInputForm utils", () => {
    describe("parseArrayType", () => {
        it("should return undefined for non-array types", () => {
            expect(parseArrayType("uint256")).toBeUndefined();
            expect(parseArrayType("tuple")).toBeUndefined();
        });

        it("should parse dynamic and fixed-size arrays", () => {
            expect(parseArrayType("uint256[]")).toEqual({
                itemType: "uint256",
                length: undefined,
            });
            expect(parseArrayType("address[2]")).toEqual({
                itemType: "address",
                length: 2,
            });
        });

        it("should parse the outermost dimension of nested arrays", () => {
            expect(parseArrayType("uint256[][3]")).toEqual({
                itemType: "uint256[]",
                length: 3,
            });
            expect(parseArrayType("tuple[]")).toEqual({
                itemType: "tuple",
                length: undefined,
            });
        });
    });

    describe("generateEmptyValue", () => {
        it("should generate empty values based on the type shape", () => {
            expect(generateEmptyValue({ type: "string" })).toBe("");
            expect(generateEmptyValue({ type: "uint256[]" })).toEqual([]);
            expect(generateEmptyValue({ type: "address[2]" })).toEqual([
                "",
                "",
            ]);
            expect(generateEmptyValue({ type: "uint8[2][2]" })).toEqual([
                ["", ""],
                ["", ""],
            ]);
            expect(
                generateEmptyValue({
                    type: "tuple[1]",
                    components: [
                        { type: "address", name: "to" },
                        { type: "uint256[]", name: "amounts" },
                    ],
                }),
            ).toEqual([["", []]]);
        });
    });

    describe("generateInitialValues", () => {
        it("should keep array params as a single flat input", () => {
            const flatInputs: AbiInputParam[] = [];
            const input = {
                type: "tuple[]",
                name: "items",
                id: "1",
                components: [
                    { type: "address", name: "to" },
                    { type: "uint256", name: "amount" },
                ],
            } as AbiInputParam;

            generateInitialValues(input, flatInputs);

            expect(flatInputs).toEqual([{ ...input, value: [] }]);
        });

        it("should flatten tuples keeping their array components", () => {
            const flatInputs: AbiInputParam[] = [];

            generateInitialValues(
                {
                    type: "tuple",
                    name: "order",
                    id: "1",
                    components: [
                        { type: "string", name: "id", id: "2" },
                        { type: "uint256[2]", name: "amounts", id: "3" },
                    ],
                } as AbiInputParam,
                flatInputs,
            );

            expect(flatInputs).toEqual([
                { type: "string", name: "id", id: "2", value: "" },
                {
                    type: "uint256[2]",
                    name: "amounts",
                    id: "3",
                    value: ["", ""],
                },
            ]);
        });
    });

    describe("encodeFunctionParam", () => {
        it("should convert array items to their base type", () => {
            expect(
                encodeFunctionParam({
                    type: "uint256[]",
                    name: "amounts",
                    value: ["1", "20"],
                }),
            ).toEqual([1n, 20n]);
            expect(
                encodeFunctionParam({
                    type: "bool[][]",
                    name: "flags",
                    value: [["true"], ["false", "true"]],
                }),
            ).toEqual([[true], [false, true]]);
        });
    });

    describe("generateFinalValues", () => {
        it("should produce values that round trip through the ABI encoding", () => {
            const inputs = parseAbiParameters(
                "uint256[] a, string[] b, address[2] c, (uint256 amount, bool active)[] d, uint256[][] e, (string name, address[] owners) f",
            ).map((input, index) => ({
                ...input,
                id: `${index}`,
                ...(input.type === "tuple"
                    ? {
                          components: input.components.map(
                              (component, componentIndex) => ({
                                  ...component,
                                  id: `${index}.${componentIndex}`,
                              }),
                          ),
                      }
                    : {}),
            })) as AbiInputParam[];

            const params: AbiInputParam[] = [];
            inputs.forEach((input) => generateInitialValues(input, params));

            const values: Record<string, AbiInputParam["value"]> = {
                "0": ["10", "20"],
                "1": ["foo", "bar"],
                "2": [addressA, addressB],
                "3": [
                    ["1", "true"],
                    ["2", "false"],
                ],
                "4": [["1"], [], ["2", "3"]],
                "5.0": "baz",
                "5.1": [addressB],
            };
            const filledParams = params.map((param) => ({
                ...param,
                value: values[param.id as string],
            }));

            const finalValues = generateFinalValues(inputs, filledParams);
            const encoded = encodeAbiParameters(inputs, finalValues);

            expect(decodeAbiParameters(inputs, encoded)).toEqual([
                [10n, 20n],
                ["foo", "bar"],
                [addressA, addressB],
                [
                    { amount: 1n, active: true },
                    { amount: 2n, active: false },
                ],
                [[1n], [], [2n, 3n]],
                { name: "baz", owners: [addressB] },
            ]);
        });
    });
});
