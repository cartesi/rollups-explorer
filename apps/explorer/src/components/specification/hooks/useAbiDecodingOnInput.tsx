"use client";
import type { Input } from "@cartesi/viem";
import { find } from "ramda";
import { isNilOrEmpty, isNotNilOrEmpty } from "ramda-adjunct";
import { findSpecificationFor } from "../conditionals";
import { decodePayload, type Envelope } from "../decoder";
import type { DbSpecification } from "../types";
import { stringifyContent } from "../utils";
import { useSpecification } from "./useSpecification";
import { useSystemSpecifications } from "./useSystemSpecifications";

type UseAbiDecodingOnInputResult = [
    string,
    {
        specApplied: DbSpecification | null;
        userSpecifications: DbSpecification[];
        systemSpecifications: DbSpecification[];
        error?: Error;
        wasSpecManuallySelected: boolean;
    },
];

const getStringifiedDecodedValueOrPayload = (
    envelope: Envelope | undefined,
    originalPayload: string,
) => {
    if (envelope?.error) {
        console.error(envelope.error);
        return originalPayload;
    }

    if (!envelope || isNilOrEmpty(envelope?.result)) {
        return originalPayload;
    }

    return stringifyContent(envelope.result);
};

/**
 * Receive the input from a json-rpc-api and
 * It may find a specification that matches a defined condition, therefore decoding the content.
 * If an specification is not found it returns the original payload.
 * @param input Input
 * @param specId Specification id to apply instead of check for matching conditions. (optional)
 * @returns { UseAbiDecodingOnInputResult }
 */
export const useAbiDecodingOnInput = (
    input: Input,
    specId?: string,
): UseAbiDecodingOnInputResult => {
    const { listSpecifications } = useSpecification();
    const { systemSpecificationAsList } = useSystemSpecifications();

    const userSpecifications = listSpecifications() ?? [];
    const specifications = [
        ...systemSpecificationAsList,
        ...userSpecifications,
    ];

    const specification = isNilOrEmpty(specId)
        ? findSpecificationFor(input, specifications)
        : (find((spec) => spec.id === specId, specifications) ?? null);

    const envelope = specification
        ? decodePayload(specification, input.decodedData.payload)
        : undefined;

    const result = getStringifiedDecodedValueOrPayload(
        envelope,
        input.decodedData.payload,
    );

    return [
        result,
        {
            specApplied: specification as DbSpecification,
            systemSpecifications: systemSpecificationAsList,
            userSpecifications,
            error: envelope?.error,
            wasSpecManuallySelected: isNotNilOrEmpty(specId),
        },
    ];
};
