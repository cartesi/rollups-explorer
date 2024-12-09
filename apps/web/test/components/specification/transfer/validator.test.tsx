import { describe, it } from "vitest";
import {
    validateSpecification,
    VALIDATOR_VERSIONS,
} from "../../../../src/components/specification/transfer/validator";
import {
    logicalOperators,
    SPECIFICATION_TRANSFER_NAME,
} from "../../../../src/components/specification/types";
import { defaultSpecificationExport } from "../stubs";

export const generateInvalidVersion = (max = Number.MAX_SAFE_INTEGER) => {
    let randomVersion;

    do {
        randomVersion = Math.floor(Math.random() * max);
    } while (VALIDATOR_VERSIONS.includes(randomVersion.toString()));

    return randomVersion;
};

describe("Specification transfer validator", () => {
    describe("V1 validator", () => {
        const v1Specification = {
            ...defaultSpecificationExport,
            version: 1,
        };

        it("should resolve valid specification", async () => {
            await expect(
                validateSpecification(v1Specification),
            ).resolves.not.toThrow();
        });

        describe("Top-level schema validation", () => {
            it("should reject with error when version is invalid", async () => {
                const invalidVersion = generateInvalidVersion();

                await expect(
                    validateSpecification({
                        ...v1Specification,
                        version: invalidVersion,
                    }),
                ).rejects.toEqual([
                    `Invalid 'version' field. Version must be of numeric value and must match one of the following values: ${VALIDATOR_VERSIONS.join(
                        ", ",
                    )}.`,
                ]);
            });

            it("should reject with error when name is invalid", async () => {
                await expect(
                    validateSpecification({
                        ...v1Specification,
                        name: "Invalid name",
                    } as any),
                ).rejects.toEqual([
                    `Missing or invalid 'name' field. The import must include a 'name' field with the string value of '${SPECIFICATION_TRANSFER_NAME}'.`,
                ]);
            });

            it("should reject with error when timestamp is invalid", async () => {
                await expect(
                    validateSpecification({
                        ...v1Specification,
                        timestamp: "Invalid timestamp",
                    } as any),
                ).rejects.toEqual([
                    "Missing 'timestamp' field. The import must include a 'timestamp' field with numeric value.",
                ]);

                await expect(
                    validateSpecification({
                        ...v1Specification,
                        timestamp: undefined,
                    } as any),
                ).rejects.toEqual([
                    "Missing 'timestamp' field. The import must include a 'timestamp' field with numeric value.",
                ]);
            });
        });

        describe("Specifications validation", () => {
            it("should reject with error when name is invalid", async () => {
                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) => ({
                                ...specification,
                                name: "",
                            }),
                        ),
                    }),
                ).rejects.toEqual(["Name is required."]);
            });

            it("should reject with error when mode is invalid", async () => {
                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) =>
                                ({
                                    ...specification,
                                    mode: "",
                                }) as any,
                        ),
                    }),
                ).rejects.toEqual(["Specification mode is required!"]);

                const invalidMode = "invalid-mode";
                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) =>
                                ({
                                    ...specification,
                                    mode: invalidMode,
                                }) as any,
                        ),
                    }),
                ).rejects.toEqual([
                    `Supported modes ["json_abi", "abi_params"] but found ${invalidMode}`,
                ]);
            });

            it("should reject with error when id is invalid", async () => {
                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) =>
                                ({
                                    ...specification,
                                    id: 1,
                                }) as any,
                        ),
                    }),
                ).rejects.toEqual(["Id field with string value is required."]);
            });

            it("should reject with error when timestamp is invalid", async () => {
                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) =>
                                ({
                                    ...specification,
                                    timestamp: false,
                                }) as any,
                        ),
                    }),
                ).rejects.toEqual([
                    "Timestamp field with numeric value is required.",
                ]);
            });

            it("should reject with error when conditions are invalid", async () => {
                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) => ({
                                ...specification,
                                conditionals: (
                                    specification.conditionals ?? []
                                ).map(
                                    (conditional) =>
                                        ({
                                            ...conditional,
                                            logicalOperator: `${conditional.logicalOperator}_invalid`,
                                        }) as any,
                                ),
                            }),
                        ),
                    }),
                ).rejects.toEqual([
                    `Invalid logical operator for condition. Valid values are: ${logicalOperators
                        .map((o) => o.value)
                        .join(", ")}`,
                ]);

                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) => ({
                                ...specification,
                                conditionals: (
                                    specification.conditionals ?? []
                                ).map(
                                    (conditional) =>
                                        ({
                                            ...conditional,
                                            conditions:
                                                conditional.conditions.map(
                                                    (condition) => ({
                                                        ...condition,
                                                        value: "",
                                                    }),
                                                ),
                                        }) as any,
                                ),
                            }),
                        ),
                    }),
                ).rejects.toEqual(["Invalid condition schema."]);

                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) => ({
                                ...specification,
                                conditionals: (
                                    specification.conditionals ?? []
                                ).map(
                                    (conditional) =>
                                        ({
                                            ...conditional,
                                            conditions:
                                                conditional.conditions.map(
                                                    (condition) => ({
                                                        ...condition,
                                                        field: "",
                                                    }),
                                                ),
                                        }) as any,
                                ),
                            }),
                        ),
                    }),
                ).rejects.toEqual(["Invalid condition schema."]);

                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) => ({
                                ...specification,
                                conditionals: (
                                    specification.conditionals ?? []
                                ).map(
                                    (conditional) =>
                                        ({
                                            ...conditional,
                                            conditions:
                                                conditional.conditions.map(
                                                    (condition) => ({
                                                        ...condition,
                                                        operator: `${conditional.logicalOperator}_invalid`,
                                                    }),
                                                ),
                                        }) as any,
                                ),
                            }),
                        ),
                    }),
                ).rejects.toEqual(["Invalid condition schema."]);
            });

            it("should reject with error when sliceTarget is invalid", async () => {
                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) =>
                                ({
                                    ...specification,
                                    sliceTarget:
                                        specification.mode === "abi_params"
                                            ? "invalid-slice-target"
                                            : null,
                                }) as any,
                        ),
                    }),
                ).rejects.toEqual(["Invalid slice target."]);
            });

            it("should reject with error when sliceInstructions are invalid", async () => {
                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) =>
                                ({
                                    ...specification,
                                    sliceInstructions:
                                        specification.mode === "abi_params"
                                            ? (
                                                  specification.sliceInstructions ??
                                                  []
                                              ).map(
                                                  (sliceInstruction) =>
                                                      ({
                                                          ...sliceInstruction,
                                                          from: "",
                                                      }) as any,
                                              )
                                            : null,
                                }) as any,
                        ),
                    }),
                ).rejects.toEqual(["Invalid slice schema."]);

                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) =>
                                ({
                                    ...specification,
                                    sliceInstructions:
                                        specification.mode === "abi_params"
                                            ? (
                                                  specification.sliceInstructions ??
                                                  []
                                              ).map(
                                                  (sliceInstruction) =>
                                                      ({
                                                          ...sliceInstruction,
                                                          to: "",
                                                      }) as any,
                                              )
                                            : null,
                                }) as any,
                        ),
                    }),
                ).rejects.toEqual(["Invalid slice schema."]);

                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) =>
                                ({
                                    ...specification,
                                    sliceInstructions:
                                        specification.mode === "abi_params"
                                            ? (
                                                  specification.sliceInstructions ??
                                                  []
                                              ).map(
                                                  (sliceInstruction) =>
                                                      ({
                                                          ...sliceInstruction,
                                                          name: "",
                                                      }) as any,
                                              )
                                            : null,
                                }) as any,
                        ),
                    }),
                ).rejects.toEqual([
                    "Invalid slice schema.",
                    "Invalid slice target.",
                ]);

                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) =>
                                ({
                                    ...specification,
                                    sliceInstructions:
                                        specification.mode === "abi_params"
                                            ? (
                                                  specification.sliceInstructions ??
                                                  []
                                              ).map(
                                                  (sliceInstruction) =>
                                                      ({
                                                          ...sliceInstruction,
                                                          type: "",
                                                      }) as any,
                                              )
                                            : null,
                                }) as any,
                        ),
                    }),
                ).rejects.toEqual(["Invalid slice schema."]);
            });

            it("should reject with error when abi is invalid", async () => {
                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) =>
                                ({
                                    ...specification,
                                    abi:
                                        specification.mode === "json_abi"
                                            ? (specification.abi ?? []).map(
                                                  vi.fn(),
                                              )
                                            : null,
                                }) as any,
                        ),
                    }),
                ).rejects.toThrow(Error);
            });

            it("should reject with error when abi params are invalid", async () => {
                await expect(
                    validateSpecification({
                        ...v1Specification,
                        specifications: v1Specification.specifications.map(
                            (specification) =>
                                ({
                                    ...specification,
                                    abiParams:
                                        specification.mode === "abi_params"
                                            ? []
                                            : null,
                                }) as any,
                        ),
                    }),
                ).rejects.toEqual(expect.anything());
            });
        });
    });
});
