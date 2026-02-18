import { isFunction } from "ramda-adjunct";
import { type SpecificationTransfer } from "../types";
import { validateSpecificationImport as v1Validator } from "./validators/v1";

type Validators = Record<
    string,
    (specification: SpecificationTransfer) => Promise<void>
>;

const validators: Validators = {
    "1": v1Validator,
} as const;

export const VALIDATOR_VERSIONS = Object.keys(validators);

export const VALIDATOR_VERSION =
    VALIDATOR_VERSIONS[VALIDATOR_VERSIONS.length - 1];

export const validateSpecification = (specification: SpecificationTransfer) => {
    const specificationVersion = specification.version?.toString();

    return new Promise((resolve, reject) => {
        if (!VALIDATOR_VERSIONS.includes(specificationVersion)) {
            return reject([
                `Invalid 'version' field. Version must be of numeric value and must match one of the following values: ${VALIDATOR_VERSIONS.join(
                    ", ",
                )}.`,
            ]);
        }

        const validator =
            validators[specificationVersion as keyof typeof validators];

        if (!isFunction(validator)) {
            return reject([
                "Missing validator for this specification version. Please contact support for further assistance.",
            ]);
        }

        validator(specification).then(resolve).catch(reject);
    });
};
