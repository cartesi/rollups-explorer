import { pipe } from "ramda";
import { createApplication, parseQueries } from "../helpers";
import type { DataInjector } from "../types";
import appOne from "./app1";
import appTwo from "./app2";
import appThree from "./app3";
import appFour from "./app4";

const listApplicationQuery = {
    queryKey: [
        "applications",
        {
            descending: true,
        },
    ],
    data: {
        pagination: {
            limit: 50,
            offset: 0,
            totalCount: 1,
        },
        data: [] as unknown[],
    },
};

const mockApplications = [appOne, appTwo, appThree, appFour];

mockApplications.forEach((app) => {
    listApplicationQuery.data.data.push(
        createApplication({
            name: app.appName,
            applicationAddress: app.appAddress,
        }),
    );
});

const addListApplicationData: DataInjector = (queryClient) => {
    const queries = parseQueries([listApplicationQuery]);
    queries.forEach((query) => {
        queryClient.setQueryData(query.queryKey, query.data);
    });

    return queryClient;
};

const setupDataInjectors = () => {
    const injectors = [addListApplicationData];
    mockApplications.forEach((app) => {
        injectors.push(app.setData);
    });

    // @ts-expect-error ts in the way.
    return pipe(...injectors);
};

const addTestCaseData = setupDataInjectors();

export default addTestCaseData;
