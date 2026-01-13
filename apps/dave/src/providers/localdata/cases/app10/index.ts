import type { Hex } from "viem";
import { parseQueries } from "../../helpers";
import type { DataInjector, UseCaseApplication } from "../../types";
import queries from "./queries";

export const appName = "AppTen";
export const appAddress = "0x857856ae0cf7da2ad7161dba89f7124bba407d0a" as Hex;

const setData: DataInjector = (queryClient) => {
    const queryList = parseQueries(queries);

    queryList.forEach((query) => {
        queryClient.setQueryData(query.queryKey, query.data);
    });

    return queryClient;
};

const useCaseApp: UseCaseApplication = {
    appAddress,
    appName,
    setData,
};

export default useCaseApp;
