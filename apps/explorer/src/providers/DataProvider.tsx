import { CartesiProvider } from "@cartesi/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, type FC, type PropsWithChildren } from "react";
import { useSelectedNodeConnection } from "../components/connection/hooks";
import queryClient from "./queryClient";
import WalletProvider from "./WalletProvider";

const DataProvider: FC<PropsWithChildren> = ({ children }) => {
    const selectedConnection = useSelectedNodeConnection();
    const client = useMemo(
        () =>
            selectedConnection?.type === "system_mock"
                ? queryClient
                : new QueryClient(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedConnection?.type, selectedConnection?.id],
    );

    return (
        <QueryClientProvider client={client} key={selectedConnection?.id}>
            <CartesiProvider rpcUrl={selectedConnection?.url ?? ""}>
                <WalletProvider>{children}</WalletProvider>
            </CartesiProvider>
        </QueryClientProvider>
    );
};

export default DataProvider;
