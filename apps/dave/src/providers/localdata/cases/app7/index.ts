import type { Hex } from "viem";
import { parseQueries } from "../../helpers";
import type { DataInjector, UseCaseApplication } from "../../types";
import queries from "./queries";

export const appName = "AppSeven";
export const appAddress = "0xc0603264a9d8f18c67c534ab9f0a71c41fead1d7" as Hex;

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
