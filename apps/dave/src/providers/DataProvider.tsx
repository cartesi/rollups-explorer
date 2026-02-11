import { CartesiProvider } from "@cartesi/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { FC, PropsWithChildren } from "react";
import { useSelectedNodeConnection } from "../components/connection/hooks";
import queryClient from "./queryClient";
import WalletProvider from "./WalletProvider";

const newQueryClient = new QueryClient();

const DataProvider: FC<PropsWithChildren> = ({ children }) => {
    const selectedConnection = useSelectedNodeConnection();

    const client =
        selectedConnection?.type === "system_mock"
            ? queryClient
            : newQueryClient;

    return (
        <QueryClientProvider client={client}>
            <CartesiProvider rpcUrl={selectedConnection?.url ?? ""}>
                <WalletProvider>{children}</WalletProvider>
            </CartesiProvider>
        </QueryClientProvider>
    );
};

export default DataProvider;
