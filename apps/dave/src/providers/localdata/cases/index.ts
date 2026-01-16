import { pipe } from "ramda";
import { createApplication, parseQueries } from "../helpers";
import type { DataInjector } from "../types";
import appOne from "./app1";
import appTen from "./app10";
import appEleven from "./app11";
import appTwelve from "./app12";
import appThirteen from "./app13";
import appFourteen from "./app14";
import appFifteen from "./app15";
import appTwo from "./app2";
import appThree from "./app3";
import appFour from "./app4";
import appFive from "./app5";
import appSix from "./app6";
import appSeven from "./app7";
import appEight from "./app8";
import appNine from "./app9";

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

const mockApplications = [
    appOne,
    appTwo,
    appThree,
    appFour,
    appFive,
    appSix,
    appSeven,
    appEight,
    appNine,
    appTen,
    appEleven,
    appTwelve,
    appThirteen,
    appFourteen,
    appFifteen,
];

mockApplications.forEach((app) => {
    listApplicationQuery.data.data.push(
        createApplication({
            name: app.appName,
            applicationAddress: app.appAddress,
        }),
    );
});

listApplicationQuery.data.pagination.totalCount = mockApplications.length;

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
