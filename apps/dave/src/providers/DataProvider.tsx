import { CartesiProvider } from "@cartesi/wagmi";
import {
    QueryClient,
    QueryClientProvider,
    type QueryClientConfig,
} from "@tanstack/react-query";
import { defaultTo, pipe } from "ramda";
import type { FC, PropsWithChildren } from "react";
import honeypotData from "./localdata/honeypot";

const mockEnabled = defaultTo(
    false,
    process.env.NEXT_PUBLIC_MOCK_ENABLED === "true",
);

const nodeRpcUrl =
    process.env.NEXT_PUBLIC_CARTESI_NODE_RPC_URL ??
    "http://127.0.0.1:10011/rpc";

const injectData = pipe(honeypotData);

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

const DataProvider: FC<PropsWithChildren> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <CartesiProvider rpcUrl={nodeRpcUrl}>{children}</CartesiProvider>
        </QueryClientProvider>
    );
};

export default DataProvider;
