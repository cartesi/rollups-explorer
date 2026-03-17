import type { QueryClient } from "@tanstack/react-query";
import { parseQueries } from "../helpers";
import type { DataInjector } from "../types";
import queries from "./queries.json";

const setHoneypotQueries: DataInjector = (
    queryClient: QueryClient,
): QueryClient => {
    const queryDataList = parseQueries(queries);

    queryDataList.forEach((queryInfo) => {
        queryClient.setQueryData(queryInfo.queryKey, queryInfo.data);
    });

    return queryClient;
};

export default setHoneypotQueries;
