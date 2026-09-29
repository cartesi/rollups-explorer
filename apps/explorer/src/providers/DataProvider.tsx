import { CartesiProvider } from "@cartesi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, type FC, type PropsWithChildren } from "react";
import { useSelectedNodeConnection } from "../components/connection/hooks";
import WalletProvider from "./WalletProvider";

const DataProvider: FC<PropsWithChildren> = ({ children }) => {
    const selectedConnection = useSelectedNodeConnection();
    const client = useMemo(
        () => new QueryClient(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedConnection?.id],
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
