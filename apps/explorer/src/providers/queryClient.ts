import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";
import { pipe } from "ramda";
import { getConfiguredMockEnabled } from "../lib/getConfigMockEnabled";
import addTestCaseData from "./localdata/cases";

const mockEnabled = getConfiguredMockEnabled();

const injectData = pipe(addTestCaseData);

const queryClientConfig: QueryClientConfig = mockEnabled
    ? {
          defaultOptions: {
              queries: {
                  staleTime: Infinity,
                  gcTime: Infinity,
                  networkMode: "always",
              },
          },
      }
    : {};

const queryClient = new QueryClient(queryClientConfig);

if (mockEnabled) {
    injectData(queryClient);
}

export default queryClient;
