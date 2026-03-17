import type { Hex } from "viem";
import { parseQueries } from "../../helpers";
import type { DataInjector, UseCaseApplication } from "../../types";
import queries from "./queries";

export const appName = "AppThirteen";
export const appAddress = "0x64a7f6c645e71c6a27343fa105cc0d480d2d9c64" as Hex;

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
