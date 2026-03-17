import type { Hex } from "viem";
import { parseQueries } from "../../helpers";
import type { DataInjector, UseCaseApplication } from "../../types";
import queries from "./queries";

export const appName = "AppThree";
export const appAddress = "0xfedcc6bfc1a7077b61fa59e91bb7f5ad67851945" as Hex;

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
