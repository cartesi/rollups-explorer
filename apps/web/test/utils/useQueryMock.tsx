import {
    CombinedError,
    UseQueryArgs,
    UseQueryResponse,
    UseQueryState,
} from "urql";
import { Mock } from "vitest";
import {
    ApplicationsDocument,
    ApplicationsQuery,
    ApplicationsQueryVariables,
} from "../../src/graphql/explorer/operations";
import {
    CheckStatusDocument,
    CheckStatusQuery,
    CheckStatusQueryVariables,
    InputDetailsDocument,
    InputDetailsQuery,
    InputDetailsQueryVariables,
} from "../../src/graphql/rollups/operations";
import {
    InputDetailsDocument as InputDetailsDocumentV2,
    InputDetailsQuery as InputDetailsQueryV2,
    InputDetailsQueryVariables as InputDetailsQueryVariablesV2,
} from "../../src/graphql/rollups/v2/operations";
import {
    applicationsSample,
    checkStatusSample,
    inputDetailsSample,
    inputDetailsSampleForPaging,
    inputDetailsSampleForPagingV2,
    inputDetailsSampleV2,
} from "./dataSamples";

type Applications = typeof applicationsSample;
type CheckStatusData = typeof checkStatusSample;
type InputDetailsData =
    | typeof inputDetailsSample
    | typeof inputDetailsSampleForPaging;

type InputDetailsDataV2 =
    | typeof inputDetailsSampleV2
    | typeof inputDetailsSampleForPagingV2;

type MockResult<T> =
    | {
          fetching?: boolean;
          data: T | undefined;
          error?: never;
          url?: string;
      }
    | {
          fetching?: boolean;
          data?: never;
          error: CombinedError;
          url?: string;
      };

interface BuilderArgs {
    apps?: MockResult<Applications>;
    checkStatus?: MockResult<CheckStatusData>;
    inputDetails?: MockResult<InputDetailsData>;
    inputDetailsV2?: MockResult<InputDetailsDataV2>;
    execQuery?: Mock<any>;
}

type CheckStatusResult = UseQueryState<
    CheckStatusQuery,
    CheckStatusQueryVariables
>;
type ApplicationsResult = UseQueryState<
    ApplicationsQuery,
    ApplicationsQueryVariables
>;

type InputDetailsResult = UseQueryState<
    InputDetailsQuery,
    InputDetailsQueryVariables
>;

type InputDetailsResultV2 = UseQueryState<
    InputDetailsQueryV2,
    InputDetailsQueryVariablesV2
>;

/**
 * Helper to generate different returns for useQuery hooks.
 * Based on query property value.
 */
export const queryMockImplBuilder =
    ({
        apps,
        checkStatus,
        inputDetails,
        execQuery,
        inputDetailsV2,
    }: BuilderArgs = {}) =>
    (args: UseQueryArgs<any, any>): UseQueryResponse => {
        const reExec = execQuery ?? vi.fn();

        if (args.query === ApplicationsDocument) {
            const result: ApplicationsResult = {
                data: { applications: apps?.data ?? applicationsSample },
                error: apps?.error,
                fetching: apps?.fetching ?? false,
                stale: false,
            };

            return [result, reExec];
        }

        if (args.query === CheckStatusDocument) {
            const result: CheckStatusResult = {
                fetching: checkStatus?.fetching ?? false,
                data: checkStatus?.data ?? undefined,
                error: checkStatus?.error,
                stale: false,
                operation: {
                    key: 1,
                    variables: {},
                    kind: "query",
                    query: CheckStatusDocument,
                    context: {
                        url: checkStatus?.url ?? "",
                        requestPolicy: "network-only",
                    },
                },
            };
            return [result, reExec];
        }

        if (args.query === InputDetailsDocument) {
            const result: InputDetailsResult = {
                fetching: inputDetails?.fetching ?? false,
                data: inputDetails?.data ?? undefined,
                error: inputDetails?.error,
                stale: false,
            };

            return [result, reExec];
        }

        if (args.query === InputDetailsDocumentV2) {
            const result: InputDetailsResultV2 = {
                fetching: inputDetailsV2?.fetching ?? false,
                data: inputDetailsV2?.data ?? undefined,
                error: inputDetailsV2?.error,
                stale: false,
            };

            return [result, reExec];
        }

        return [{ fetching: false, stale: false }, reExec];
    };
