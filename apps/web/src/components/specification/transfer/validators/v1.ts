import {
    isArray,
    isNonEmptyString,
    isNotString,
    isNumber,
} from "ramda-adjunct";
import { parseAbi, parseAbiParameters } from "viem";
import {
    logicalOperators,
    operators,
    Specification,
    SPECIFICATION_TRANSFER_NAME,
    SpecificationTransfer,
} from "../../types";
import { formatAbi } from "abitype";
import { prepareSignatures } from "../../utils";
import { specModeValidation, specNameValidation } from "../../form/validations";
import { uniq } from "ramda";

const validateSpecifications = (
    specifications: Specification[],
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const errors = uniq(
            specifications.reduce(
                (accumulator: (string | null)[], specification) => {
                    const nameError = specNameValidation(specification.name);
                    const modeError = specModeValidation(specification.mode);
                    const idError = isNonEmptyString(specification.id)
                        ? null
                        : "Id field with string value is required.";
                    const timestampError = isNumber(specification.timestamp)
                        ? null
                        : "Timestamp field with numeric value is required.";

                    let abiError = null;
                    if (specification.mode === "json_abi") {
                        const formattedAbi = formatAbi(
                            specification.abi ?? [],
                        ).join("\n");
                        const items = prepareSignatures(formattedAbi);

                        try {
                            parseAbi(items);
                        } catch (error: any) {
                            abiError = error.message;
                        }
                    } else if (specification.mode === "abi_params") {
                        try {
                            parseAbiParameters(specification.abiParams);
                        } catch (error: any) {
                            abiError = error.message;
                        }
                    }

                    const conditionsErrors = (
                        specification?.conditionals ?? []
                    ).reduce(
                        (
                            conditionAccumulator: (string | null)[],
                            condition,
                        ) => {
                            const logicalOperatorError = logicalOperators.some(
                                (o) => o.value === condition.logicalOperator,
                            )
                                ? null
                                : `Invalid logical operator for condition. Valid values are: ${logicalOperators
                                      .map((o) => o.value)
                                      .join(", ")}`;

                            const schemaErrors = condition.conditions.reduce(
                                (
                                    conditionAccumulator: (string | null)[],
                                    conditionItem,
                                ) => {
                                    const error =
                                        isNonEmptyString(conditionItem.field) &&
                                        operators.some(
                                            (o) =>
                                                o.value ===
                                                conditionItem.operator,
                                        ) &&
                                        isNonEmptyString(conditionItem.value)
                                            ? null
                                            : "Invalid condition schema.";

                                    return [...conditionAccumulator, error];
                                },
                                [],
                            );

                            return [
                                ...conditionAccumulator,
                                logicalOperatorError,
                                ...schemaErrors,
                            ];
                        },
                        [],
                    );

                    let sliceErrors: (string | null)[] = [];
                    if (specification.mode === "abi_params") {
                        const sliceTargetError = (
                            specification?.sliceInstructions ?? []
                        ).some((s) => s.name === specification.sliceTarget)
                            ? null
                            : "Invalid slice target.";

                        sliceErrors = [
                            ...(specification?.sliceInstructions ?? []).reduce(
                                (
                                    sliceAccumulator: (string | null)[],
                                    sliceInstruction,
                                ) => {
                                    const error =
                                        isNumber(sliceInstruction.from) &&
                                        isNumber(sliceInstruction.to) &&
                                        isNonEmptyString(
                                            sliceInstruction.name,
                                        ) &&
                                        isNonEmptyString(sliceInstruction.type)
                                            ? null
                                            : "Invalid slice schema.";

                                    return [...sliceAccumulator, error];
                                },
                                [],
                            ),
                            sliceTargetError,
                        ];
                    }

                    const errors = [
                        nameError,
                        modeError,
                        idError,
                        timestampError,
                        abiError,
                        ...conditionsErrors,
                        ...sliceErrors,
                    ].filter((error) => isNonEmptyString(error));

                    return [...accumulator, ...errors];
                },
                [],
            ),
        );

        if (errors.length > 0) {
            return reject(errors);
        }

        resolve();
    });
};

const validateTopLevelSchema = (
    specificationImport: SpecificationTransfer,
): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (
            isNotString(specificationImport.name) ||
            specificationImport.name !== SPECIFICATION_TRANSFER_NAME
        ) {
            return reject([
                `Missing or invalid 'name' field. The import must include a 'name' field with the string value of '${SPECIFICATION_TRANSFER_NAME}'.`,
            ]);
        }

        if (!isNumber(specificationImport.timestamp)) {
            return reject([
                "Missing 'timestamp' field. The import must include a 'timestamp' field with numeric value.",
            ]);
        }

        if (
            !isArray(specificationImport.specifications) ||
            specificationImport.specifications.length === 0
        ) {
            return reject(["No specifications exist in the import."]);
        }

        resolve();
    });
};

export const validateSpecificationImport = async (
    specificationImport: SpecificationTransfer,
): Promise<void> => {
    await validateTopLevelSchema(specificationImport);
    return await validateSpecifications(specificationImport.specifications);
};
