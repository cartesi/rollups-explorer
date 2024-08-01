import { isNotNilOrEmpty } from "ramda-adjunct";
import { SpecFormValues } from "./form/context";
import { Specification } from "./types";

/**
 * Replacer to be used with JSON.stringify as the default internal
 * parser does not deal with bigint yet.
 * @param key
 * @param value
 * @returns
 */
export const replacerForBigInt = (_key: any, value: any) => {
    return typeof value === "bigint" ? value.toString() : value;
};

export const stringifyContent = (value: Record<string, any>) =>
    JSON.stringify(value, replacerForBigInt, 2);

const Separator = "\n" as const;

/**
 * Expects a string with multiple ABI signatures in human readable format.
 * It will be splitted and trimmed removing extra whitespaces, returning an list of strings.
 * @param multiline String with human readable ABI signatures separated by a newline (i.e. \n)
 * @returns
 */
export const prepareSignatures = (multiline: string) =>
    multiline.split(Separator).map((signature) => signature?.trim());

/**
 * When the form values has the minimum necessary for the defined
 * specification mode it will return a Specification otherwise it returns null;
 * @param {SpecFormValues} values
 * @returns  {(Specification|null)}
 */
export const buildSpecification = (
    values: SpecFormValues,
): Specification | null => {
    const {
        mode,
        name,
        sliceInstructions,
        abi,
        abiParams,
        conditionals,
        sliceTarget,
        editingData,
        formMode,
    } = values;
    const version = 1;
    const timestamp = Date.now();
    const id =
        formMode === "EDITION" ? editingData?.originalSpec.id : undefined;
    const commons = { conditionals, timestamp, version, name, id };

    if (
        mode === "abi_params" &&
        (isNotNilOrEmpty(abiParams) || isNotNilOrEmpty(sliceInstructions))
    ) {
        return {
            ...commons,
            mode,
            abiParams,
            sliceInstructions:
                sliceInstructions.length > 0 ? sliceInstructions : undefined,
            sliceTarget: sliceTarget,
        } as Specification;
    } else if (mode === "json_abi" && isNotNilOrEmpty(abi)) {
        return {
            ...commons,
            mode,
            abi,
        } as Specification;
    }

    return null;
};
