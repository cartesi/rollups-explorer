import { FC, ReactNode, createContext, useContext } from "react";
import { getConfiguredPublicExplorerAPI } from "../lib/getConfigExplorerAPIUrl";
import { getConfiguredNodeRpcUrl } from "../lib/getConfigNodeRpcUrl";
import getConfiguredChainId from "../lib/getConfiguredChain";

export interface AppConfigContextProps {
    apiEndpoint: string;
    nodeRpcUrl: string;
    chainId: string;
}

interface AppConfigProviderProps {
    children: ReactNode;
    value: AppConfigContextProps;
}

const AppConfigContext = createContext<AppConfigContextProps>({
    chainId: getConfiguredChainId(),
    apiEndpoint: getConfiguredPublicExplorerAPI(),
    nodeRpcUrl: getConfiguredNodeRpcUrl(),
});

export const useAppConfig = () => {
    const config = useContext(AppConfigContext);
    return config;
};

export const AppConfigProvider: FC<AppConfigProviderProps> = ({
    children,
    value,
}) => {
    return <AppConfigContext value={value}>{children}</AppConfigContext>;
};
