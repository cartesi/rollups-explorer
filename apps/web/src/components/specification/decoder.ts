import {
    T,
    cond,
    head,
    includes,
    isEmpty,
    isNil,
    pathEq,
    pathOr,
    pipe,
} from "ramda";
import { isNotNilOrEmpty } from "ramda-adjunct";
import {
    AbiDecodingDataSizeTooSmallError,
    AbiFunction,
    AbiFunctionSignatureNotFoundError,
    AbiParameter,
    Hex,
    InvalidAbiParametersError,
    decodeAbiParameters,
    decodeFunctionData,
    parseAbiParameters,
    slice,
    SliceOffsetOutOfBoundsError,
} from "viem";
import SpecificationModeNotSupportedError from "./errors/SpecificationModeNotSupported";
import { ABI_PARAMS, JSON_ABI, Specification, specModes } from "./types";

interface Piece {
    name: string;
    part: Hex | Uint8Array;
    decodedPart?: any;
}

export interface Envelope {
    spec: Specification;
    input: Hex | Uint8Array;
    pieces: Piece[];
    result: Record<string, any>;
    error?: Error;
}

const getPieces = (
    abiParams: readonly string[],
    encodedData: Hex | Uint8Array,
): Piece[] => {
    const abiParameters = parseAbiParameters(abiParams);

    const resultList = decodeAbiParameters(
        // @ts-ignore dynamic type complains
        abiParameters,
        encodedData,
    );

    return resultList.map((decodedVal, index) => {
        // @ts-ignore
        const { name } = abiParameters[index] as {
            name: string;
        };

        return {
            name,
            part: encodedData,
            decodedPart: decodedVal,
        } as Piece;
    });
};

const addPiecesToEnvelope = (e: Envelope): Envelope => {
    if (!e.error && e.spec.mode === "abi_params") {
        try {
            if (e.spec.sliceInstructions?.length) {
                e.spec.sliceInstructions.forEach((instruction, index) => {
                    const {
                        from,
                        to,
                        name,
                        type,
                        optional = false,
                    } = instruction;
                    let part;

                    try {
                        part = slice(e.input, from, to);
                    } catch (err: any) {
                        if (
                            err instanceof SliceOffsetOutOfBoundsError &&
                            optional
                        ) {
                            part = "0x" as Hex;
                        } else {
                            throw err;
                        }
                    }

                    const decodedPart =
                        !isNil(type) && !isEmpty(type)
                            ? head(decodeAbiParameters([{ type, name }], part))
                            : part;

                    e.pieces.push({
                        name: name ?? `param${index}`,
                        part,
                        decodedPart,
                    });
                });
            } else {
                const pieces = getPieces(e.spec.abiParams, e.input);
                e.pieces.push(...pieces);
            }
        } catch (error: any) {
            const message = pathOr(error.message, ["shortMessage"], error);
            const errorMeta = pathOr([], ["metaMessages"], error).join("\n");
            e.error = new Error(`${message}\n\n${errorMeta}`);
        }
    }

    return e;
};

const decodeTargetSliceAndAddToPieces = (e: Envelope): Envelope => {
    if (!e.error && e.spec.mode === "abi_params") {
        const targetName = e.spec.sliceTarget;
        const piece = e.pieces.find((piece) => piece.name === targetName);

        try {
            if (piece && piece.part) {
                const pieces = getPieces(e.spec.abiParams, piece.part);
                e.pieces.push(...pieces);
            }
        } catch (error: any) {
            const message = pathOr(error.message, ["shortMessage"], error);
            let errorMeta;
            let extra;

            if (error instanceof AbiDecodingDataSizeTooSmallError) {
                errorMeta = pathOr([], ["metaMessages"], error).join("\n");
                extra = `Slice name: "${targetName}" (Is it the right one?)`;
            }

            if (error instanceof InvalidAbiParametersError) {
                errorMeta = `ABI Parameters : [ ${e.spec.abiParams.join(
                    ",",
                )} ]`;
                extra = "Check the ABI parameters defined.";
            }

            const errorMessage = `${message}\n\n${errorMeta ?? ""}\n${
                extra ?? ""
            }`;

            e.error = new Error(errorMessage);
        }
    }
    return e;
};

const prepareResultFromPieces = (e: Envelope): Envelope => {
    if (!e.error && e.spec.mode === "abi_params") {
        const sliceTarget = e.spec.sliceTarget;
        e.result = e.pieces.reduce((prev, { name, decodedPart }, index) => {
            /**
             * Adding a unwrap effect
             * decoded target is not included in the result
             */
            if (sliceTarget === name) return prev;

            const key = name ?? `params${index}`;
            return { ...prev, [key]: decodedPart };
        }, {});
    }

    return e;
};

type AbiParameterInfo = {
    param: AbiParameter;
    index: number;
};

/**
 * Check the AbiParameter in the following precedence order [name, type]
 * and returns the first available.
 * Fallback to `arg-{index}` based on the parameter position passed to the abi function.
 */
const getAbiParamIdentifier = cond<[info: AbiParameterInfo], string>([
    [(info) => isNotNilOrEmpty(info.param.name), pathOr("", ["param", "name"])],
    [(info) => isNotNilOrEmpty(info.param.type), pathOr("", ["param", "type"])],
    [T, (info) => `arg-${info.index}`],
]);

const prepareResultForJSONABI = (e: Envelope): Envelope => {
    if (e.spec.mode === "json_abi") {
        try {
            const { functionName, args } = decodeFunctionData({
                abi: e.spec.abi,
                data: e.input as Hex,
            });

            const orderedNamedArgs: [string, any][] = [];

            if (args && args?.length > 0) {
                const abiItem = e.spec.abi.find(
                    (item) =>
                        item.type === "function" && item.name === functionName,
                ) as AbiFunction;

                // respecting order of arguments but including abi names
                abiItem.inputs.forEach((param, index) => {
                    const name = getAbiParamIdentifier({ param, index });
                    orderedNamedArgs.push([name, args[index]]);
                });
            }

            e.result = {
                functionName,
                args,
                orderedNamedArgs,
            };
        } catch (err: any) {
            const message =
                err instanceof AbiFunctionSignatureNotFoundError
                    ? err.shortMessage
                    : err.message;
            e.error = new Error(message);
        }
    }

    return e;
};

const transform: (e: Envelope) => Envelope = cond([
    [
        pathEq(ABI_PARAMS, ["spec", "mode"]),
        pipe(
            addPiecesToEnvelope,
            decodeTargetSliceAndAddToPieces,
            prepareResultFromPieces,
        ),
    ],
    [pathEq(JSON_ABI, ["spec", "mode"]), prepareResultForJSONABI],
    [
        T,
        (e: Envelope) => {
            e.error = new SpecificationModeNotSupportedError(e.spec);
            return e;
        },
    ],
]);

/**
 * Decode the payload data based on the specification passed. The return
 * contains the result but also could contain an error as a value, therefore
 * the callee should decide what to do with it.
 * @param spec {Specification}
 * @param payload {Hex | Uint8Array}
 * @throws {SpecificationModeNotSupportedError}
 * @returns {Envelope}
 */
export function decodePayload(
    spec: Specification,
    input: Hex | Uint8Array,
): Envelope {
    if (!includes(spec.mode, specModes)) {
        throw new SpecificationModeNotSupportedError(spec);
    }

    const envelope: Envelope = {
        spec,
        input,
        pieces: [],
        result: {},
    };

    return transform(envelope);
}
