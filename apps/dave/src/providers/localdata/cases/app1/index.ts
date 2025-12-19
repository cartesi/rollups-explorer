import type { Hex } from "viem";
import { parseQueries } from "../../helpers";
import type { DataInjector } from "../../types";
import queries from "./queries.json";

export const appName = "AppOne";
export const appAddress = "0xFc0E04b72f5630b277a07cD50c7F88Ca2331EB65" as Hex;

const setData: DataInjector = (queryClient) => {
    const queryList = parseQueries(queries);

    queryList.forEach((query) => {
        queryClient.setQueryData(query.queryKey, query.data);
    });

    return queryClient;
};

export default {
    appName,
    appAddress,
    setData,
};
