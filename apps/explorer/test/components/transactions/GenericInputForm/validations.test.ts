import { describe, expect, it } from "vitest";
import { initialValues } from "../../../../src/components/transactions/GenericInputForm/initialValues";
import type {
    AbiInputParam,
    FormValues,
} from "../../../../src/components/transactions/GenericInputForm/types";
import { validateAbiFunctionParamValue } from "../../../../src/components/transactions/GenericInputForm/validations";

const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const validate = (param: Omit<AbiInputParam, "components" | "name">) => {
    const values: FormValues = {
        ...initialValues,
        mode: "abi",
        abiFunctionParams: [
            { name: "param", components: [], ...param } as AbiInputParam,
        ],
    };

    return validateAbiFunctionParamValue(
        param.value,
        values,
        "abiFunctionParams.0.value",
    );
};

describe("GenericInputForm validations", () => {
    describe("validateAbiFunctionParamValue", () => {
        it("should keep validating primitive values", () => {
            expect(validate({ type: "uint256", value: "10" })).toBeNull();
            expect(validate({ type: "uint256", value: "abc" })).toBe(
                "Invalid uint256 value",
            );
            expect(validate({ type: "string", value: "" })).toBe(
                "Invalid string value",
            );
        });

        it("should accept an empty dynamic array", () => {
            expect(validate({ type: "uint256[]", value: [] })).toBeNull();
        });

        it("should validate every array item with its base type", () => {
            expect(
                validate({ type: "uint256[]", value: ["1", "2"] }),
            ).toBeNull();
            expect(validate({ type: "uint256[]", value: ["1", "x"] })).toBe(
                "Invalid uint256 value at [1]",
            );
            expect(validate({ type: "string[]", value: ["foo", ""] })).toBe(
                "Invalid string value at [1]",
            );
            expect(
                validate({ type: "address[][]", value: [[address], ["0x1"]] }),
            ).toBe("Invalid address value at [1][0]");
        });

        it("should validate the length of fixed-size arrays", () => {
            expect(
                validate({ type: "address[2]", value: [address, address] }),
            ).toBeNull();
            expect(validate({ type: "address[2]", value: [address] })).toBe(
                "Invalid address[2] value",
            );
        });

        it("should validate tuple array items by component", () => {
            const components = [
                { type: "address", name: "to" },
                { type: "uint256", name: "amount" },
            ];

            expect(
                validate({
                    type: "tuple[]",
                    components,
                    value: [[address, "1"]],
                } as AbiInputParam),
            ).toBeNull();
            expect(
                validate({
                    type: "tuple[]",
                    components,
                    value: [
                        [address, "1"],
                        [address, "-"],
                    ],
                } as AbiInputParam),
            ).toBe("Invalid uint256 value at [1].amount");
        });
    });
});
