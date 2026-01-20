import { CartesiProvider } from "@cartesi/wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import type { FC, PropsWithChildren } from "react";
import queryClient from "./queryClient";

const nodeRpcUrl =
    process.env.NEXT_PUBLIC_CARTESI_NODE_RPC_URL ??
    "http://127.0.0.1:10011/rpc";

const DataProvider: FC<PropsWithChildren> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <CartesiProvider rpcUrl={nodeRpcUrl}>{children}</CartesiProvider>
        </QueryClientProvider>
    );
};

export default DataProvider;
