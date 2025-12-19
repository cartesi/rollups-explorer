import type { Hex } from "viem";
import { parseQueries } from "../../helpers";
import type { DataInjector } from "../../types";
import queries from "./queries.json";

export const appName = "AppTwo";
export const appAddress = "0x245216ec64bef3a84d040cc9aba864763434f29d" as Hex;

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
