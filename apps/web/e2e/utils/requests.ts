import { Request } from "@playwright/test";

/**
 * @description Finds the GraphQL request
 * @param request
 * @return boolean
 */
export const findGraphQlRequest = (request: Request) => {
    return request.url().includes("/graphql") && request.method() === "POST";
};

/**
 * @description Finds the request for applications filtered by v2 rollups version
 * @param request
 * @return boolean
 */
export const findApplicationsRequestForRollupsV2 = (request: Request) => {
    const postData = request.postData();
    let parsedPostData;

    if (postData) {
        parsedPostData = JSON.parse(postData);
    }

    return (
        findGraphQlRequest(request) &&
        parsedPostData?.variables?.where?.rollupVersion_in?.length === 1 &&
        parsedPostData.variables.where.rollupVersion_in[0] === "v2"
    );
};

/**
 * @description Finds the request for inputs filtered by v2 rollups version
 * @param request
 * @return boolean
 */
export const findInputsRequestForRollupsV2 = (request: Request) => {
    const postData = request.postData();
    let parsedPostData;

    if (postData) {
        parsedPostData = JSON.parse(postData);
    }

    return (
        findGraphQlRequest(request) &&
        parsedPostData?.variables?.where?.AND?.length === 1 &&
        parsedPostData?.variables?.where?.AND[0].application?.rollupVersion_in
            ?.length === 1 &&
        parsedPostData.variables.where.AND[0].application
            .rollupVersion_in[0] === "v2"
    );
};

/**
 * @description Finds the paginated GraphQL request
 * @param request
 * @param after
 * @return boolean
 */
export const findGraphQlPaginatedRequest = (
    request: Request,
    after: number,
) => {
    const postData = request.postData();
    let parsedPostData;

    if (postData) {
        parsedPostData = JSON.parse(postData);
    }

    return (
        findGraphQlRequest(request) &&
        parsedPostData?.variables?.after === after.toString()
    );
};
