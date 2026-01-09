import type { Hex } from "viem";
import { parseQueries } from "../../helpers";
import type { DataInjector, UseCaseApplication } from "../../types";
import queries from "./queries";

export const appName = "AppFive";
export const appAddress = "0x27c2cb273d92f9c318696124018fc7adb8873122" as Hex;

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
