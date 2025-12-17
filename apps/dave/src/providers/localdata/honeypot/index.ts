import type { QueryClient } from "@tanstack/react-query";
import type { DataInjector } from "../types";
import queries from "./queries.json";

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

const setHoneypotQueries: DataInjector = (
    queryClient: QueryClient,
): QueryClient => {
    const queryDataList = JSON.parse(
        JSON.stringify(queries),
        reviver,
    ) as QueryValue[];

    queryDataList.forEach((queryInfo) => {
        queryClient.setQueryData(queryInfo.queryKey, queryInfo.data);
    });

    return queryClient;
};

export default setHoneypotQueries;
