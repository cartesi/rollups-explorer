import { includes, uniq } from "ramda";
import {
    isBlank,
    isNilOrEmpty,
    isNonEmptyString,
    isNotNilOrEmpty,
    isNotString,
    isNumber,
} from "ramda-adjunct";
import { Abi, Hex, isHex, parseAbi, parseAbiParameters } from "viem";
import {
    logicalOperators,
    Modes,
    operators,
    Predicate,
    SliceInstruction,
    Specification,
    SpecificationTransfer,
    ValidationType,
} from "../types";
import { SpecFormValues } from "./context";
import { getInitialValues } from "../SpecificationFormView";
import { formatAbi } from "abitype";
import { prepareSignatures } from "../utils";
import { ReactNode } from "react";

const specNameValidation = (value: string) => {
    if (isBlank(value)) return "Name is required.";

    return null;
};

const specModeValidation = (value: Modes) => {
    if (isBlank(value)) return "Specification mode is required!";

    if (!includes(value, ["json_abi", "abi_params"]))
        return `Supported modes ["json_abi", "abi_params"] but found ${value}`;

    return null;
};

const specABIValidation = (value: Abi | undefined, values: SpecFormValues) => {
    if (values.mode !== "json_abi") return null;

    if (isNilOrEmpty(value)) return "The ABI is required on JSON ABI mode.";

    return null;
};

const specAbiParamValidation = (value: string[], values: SpecFormValues) => {
    if (values.mode === "abi_params") {
        if (!values.sliceInstructionsOn && isNilOrEmpty(value))
            return "At least one ABI parameter is required when not defining the byte range slices.";

        if (
            values.sliceInstructionsOn &&
            isNotNilOrEmpty(values.sliceTarget) &&
            isNilOrEmpty(value)
        )
            return `A slice name ${values.sliceTarget} was selected, making ABI parameter required!`;
    }

    return null;
};

const specSliceInstructionsValidation = (
    value: SliceInstruction[],
    values: SpecFormValues,
) => {
    if (values.mode === "abi_params" && values.sliceInstructionsOn) {
        if (isNilOrEmpty(value))
            return "Byte range is on, so at least one slice is required!";
    }

    return null;
};

const specConditionalsValidation = (
    value: Predicate[],
    values: SpecFormValues,
) => {
    if (values.conditionalsOn && isNilOrEmpty(value))
        return "Conditions is on, make sure the empty fields are filled!";

    return null;
};

const specEncodedDataValidation = (value: Hex | undefined) => {
    if (!isBlank(value) && !isHex(value))
        return "Encoded data should be in Hex format!";

    return null;
};

const validateSpecifications = (
    specifications: Specification[],
    version: number,
) => {
    if (specifications.length === 0) {
        return ["No specifications exist in the import."];
    }

    return specifications.reduce(
        (accumulator: (string | null)[], initialSpecification) => {
            const specification = getInitialValues(initialSpecification);
            const nameError = specNameValidation(specification.name);
            const modeError = specModeValidation(specification.mode);
            const idError = isNonEmptyString(initialSpecification.id)
                ? null
                : "Id field with string value is required.";
            const timestampError = isNumber(initialSpecification.timestamp)
                ? null
                : "Timestamp field with numeric value is required.";
            const versionError =
                initialSpecification.version === version
                    ? null
                    : "Version is invalid.";

            let abiError = null;
            if (specification.mode === "json_abi") {
                const formattedAbi = formatAbi(specification.abi ?? []).join(
                    "\n",
                );
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

            const conditionsErrors = (specification?.conditionals ?? []).reduce(
                (conditionAccumulator: (string | null)[], condition) => {
                    const logicalOperatorError = logicalOperators.some(
                        (o) => o.value === condition.logicalOperator,
                    )
                        ? null
                        : "Invalid logical operator";

                    const schemaErrors = condition.conditions.reduce(
                        (
                            conditionAccumulator: (string | null)[],
                            conditionItem,
                        ) => {
                            const error =
                                isNonEmptyString(conditionItem.field) &&
                                operators.some(
                                    (o) => o.value === conditionItem.operator,
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
                                isNonEmptyString(sliceInstruction.name) &&
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
                versionError,
                abiError,
                ...conditionsErrors,
                ...sliceErrors,
            ].filter((error) => isNonEmptyString(error));

            return [...accumulator, ...errors];
        },
        [],
    );
};

const validateSpecificationImport = (
    specificationImport: SpecificationTransfer,
    version: number,
    name: string,
    onComplete: (message: ReactNode, type?: ValidationType) => void,
) => {
    // Validate top level schema
    if (!isNumber(specificationImport.version)) {
        return onComplete(
            "Missing 'version' field. The import must include a 'version' field with numeric value.",
        );
    }

    if (specificationImport.version !== version) {
        return onComplete(
            `Invalid 'version' field. Required version is '${version}', while the import version is '${specificationImport.version}'`,
        );
    }

    if (isNotString(specificationImport.name)) {
        return onComplete(
            "Missing 'name' field. The import must include a 'name' field with the string value of 'cartesiscan_specifications_export'.",
        );
    }

    if (specificationImport.name !== name) {
        return onComplete(
            `Invalid 'name' field. Value for this field must be '${name}'.`,
        );
    }

    if (!isNumber(specificationImport.timestamp)) {
        return onComplete(
            "Missing 'timestamp' field. The import must include a 'timestamp' field with numeric value.",
        );
    }

    // Validate specifications array
    const specificationErrors = uniq(
        validateSpecifications(specificationImport.specifications, version),
    );

    if (specificationErrors.length > 0) {
        return onComplete(
            <>
                <div>
                    Some of the imported specifications are not valid. Please
                    check the following errors:
                </div>
                <div>
                    {specificationErrors.map((error) => (
                        <div key={error}>{error}</div>
                    ))}
                </div>
            </>,
        );
    } else {
        onComplete(
            "Specification import is valid. No errors found.",
            "success",
        );
    }
};

export {
    specABIValidation,
    specAbiParamValidation,
    specConditionalsValidation,
    specEncodedDataValidation,
    specModeValidation,
    specNameValidation,
    specSliceInstructionsValidation,
    validateSpecifications,
    validateSpecificationImport,
};
