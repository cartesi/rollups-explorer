export const stringifyContent = (value: any) => JSON.stringify(value, null, 2);

const Separator = "\n" as const;

/**
 * Expects a string with multiple ABI signatures in human readable format.
 * It will be splitted and trimmed removing extra whitespaces, returning an list of strings.
 * @param multiline String with human readable ABI signatures separated by a newline (i.e. \n)
 * @returns
 */
export const prepareSignatures = (multiline: string) =>
    multiline.split(Separator).map((signature) => signature?.trim());
