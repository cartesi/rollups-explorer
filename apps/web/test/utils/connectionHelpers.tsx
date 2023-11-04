import {
    CombinedError,
    UseQueryArgs,
    UseQueryResponse,
    UseQueryState,
} from "urql";
import {
    ApplicationsDocument,
    ApplicationsQuery,
    ApplicationsQueryVariables,
} from "../../src/graphql";
import {
    CheckStatusDocument,
    CheckStatusQuery,
    CheckStatusQueryVariables,
} from "../../src/graphql/rollups/operations";
import { useConnectionConfig } from "../../src/providers/connectionConfig/hooks";

type Applications = typeof applicationsSample;
type CheckStatusData = typeof checkStatusSample;

type MockResult<T> =
    | {
          fetching?: boolean;
          data: T;
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
}

type CheckStatusResult = UseQueryState<
    CheckStatusQuery,
    CheckStatusQueryVariables
>;
type ApplicationsResult = UseQueryState<
    ApplicationsQuery,
    ApplicationsQueryVariables
>;

type UseConnectionConfigReturn = ReturnType<typeof useConnectionConfig>;

const connectionStubs: UseConnectionConfigReturn = {
    hasConnection: vi.fn(),
    addConnection: vi.fn(),
    removeConnection: vi.fn(),
    getConnection: vi.fn(),
    hideConnectionModal: vi.fn(),
    showConnectionModal: vi.fn(),
    listConnections: vi.fn(),
};

/**
 * TS helper for intellisense and autocompletion for methods like `mockReturnValue`
 */
export const useConnectionConfigReturnStub = vi.mocked(connectionStubs, true);
/**
 * A list of applications with only id property
 */
export const applicationsSample = [
    { id: "0x60a7048c3136293071605a4eaffef49923e981cc" },
    { id: "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c" },
    { id: "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3" },
];

export const checkStatusSample = {
    inputs: {
        totalCount: 775,
    },
    vouchers: {
        totalCount: 1,
    },
    reports: {
        totalCount: 775,
    },
    notices: {
        totalCount: 0,
    },
};

/**
 * Helper to generate different returns for useQuery hooks.
 * for ApplicationDocument and CheckStatusDocument
 */
export const queryMockImplBuilder =
    ({ apps, checkStatus }: BuilderArgs = {}) =>
    (args: UseQueryArgs<any, any>): UseQueryResponse => {
        const reExec = vi.fn();

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

        return [{ fetching: false, stale: false }, reExec];
    };
