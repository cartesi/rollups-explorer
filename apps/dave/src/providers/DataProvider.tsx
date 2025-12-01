import { CartesiProvider } from "@cartesi/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { FC, PropsWithChildren } from "react";

const queryClient = new QueryClient();

const DataProvider: FC<PropsWithChildren> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <CartesiProvider rpcUrl="http://127.0.0.1:10011/rpc">
                {children}
            </CartesiProvider>
        </QueryClientProvider>
    );
};

export default DataProvider;
