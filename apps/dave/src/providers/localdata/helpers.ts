import type { Application } from "@cartesi/viem";

type QueryValue = { queryKey: unknown[]; data: unknown };

const reviver = (_: string, value: unknown) => {
    const dateReg = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;
    if (typeof value === "string" && value.includes("$bigint:")) {
        return BigInt(value.replace("$bigint:", ""));
    }

    if (typeof value === "string" && dateReg.exec(value)) {
        return new Date(value);
    }

    return value;
};

/**
 * Expect a list of react-query cache data as exported in debug mode.
 * It will parse the JSON taking care of bigints and dates to be correctly cast
 * to its type.
 * @param queries List of react-query cache data objects.
 * @returns
 */
export const parseQueries = (queries: unknown[]): QueryValue[] => {
    return JSON.parse(JSON.stringify(queries), reviver);
};

/**
 * Generates a valid JSON application accepting partial values
 * to generate different applications.
 * @param cfg
 * @returns
 */
export const createApplication = (cfg: Partial<Application>) => {
    return {
        name: "Honeypot",
        applicationAddress: "0xFc0E04b72f5630b277a07cD50c7F88Ca2331EB65",
        consensusAddress: "0x44DC8F7BfA033E464CD672561AA62Ad147f24012",
        inputBoxAddress: "0xBB655FfBee3Cf2dc4f5809Cdaba18f357278427D",
        templateHash:
            "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
        epochLength: "$bigint:0",
        dataAvailability: {
            type: "InputBox",
            inputBoxAddress: "0xBB655FfBee3Cf2dc4f5809Cdaba18f357278427D",
            ...cfg.dataAvailability,
        },
        consensusType: "PRT",
        state: "ENABLED",
        reason: null,
        inputBoxBlock: "$bigint:3",
        lastEpochCheckBlock: "$bigint:2035",
        lastInputCheckBlock: "$bigint:2035",
        lastOutputCheckBlock: "$bigint:2035",
        processedInputs: "$bigint:3",
        createdAt: "2025-12-18T14:16:49.057Z",
        updatedAt: "2025-12-18T15:44:53.819Z",
        ...cfg,
        executionParameters: {
            snapshotPolicy: "NONE",
            advanceIncCycles: "$bigint:4194304",
            advanceMaxCycles: "$bigint:4611686018427387903",
            inspectIncCycles: "$bigint:4194304",
            inspectMaxCycles: "$bigint:4611686018427387903",
            advanceIncDeadline: "$bigint:10000000000",
            advanceMaxDeadline: "$bigint:180000000000",
            inspectIncDeadline: "$bigint:10000000000",
            inspectMaxDeadline: "$bigint:180000000000",
            loadDeadline: "$bigint:300000000000",
            storeDeadline: "$bigint:180000000000",
            fastDeadline: "$bigint:5000000000",
            maxConcurrentInspects: 10,
            createdAt: "2025-12-18T14:16:49.057Z",
            updatedAt: "2025-12-18T14:16:49.057Z",
            ...cfg.executionParameters,
        },
    };
};
