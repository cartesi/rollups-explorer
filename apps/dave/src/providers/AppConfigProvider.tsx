import { type FC, type ReactNode, createContext, useContext } from "react";
import { getConfiguredCartesiNodeRpcUrl } from "../lib/getConfigCartesiNodeRpcUrl";
import { getConfiguredDebugEnabled } from "../lib/getConfigDebugEnabled";
import { getConfiguredMockEnabled } from "../lib/getConfigMockEnabled";
import { getConfiguredNodeRpcUrl } from "../lib/getConfigNodeRpcUrl";

export interface AppConfigContextProps {
    nodeRpcUrl: string;
    cartesiNodeRpcUrl: string;
    isMockEnabled: boolean;
    isDebugEnabled: boolean;
}

interface AppConfigProviderProps {
    children: ReactNode;
    value: AppConfigContextProps;
}

const AppConfigContext = createContext<AppConfigContextProps>({
    cartesiNodeRpcUrl: getConfiguredCartesiNodeRpcUrl(),
    nodeRpcUrl: getConfiguredNodeRpcUrl(),
    isMockEnabled: getConfiguredMockEnabled(),
    isDebugEnabled: getConfiguredDebugEnabled(),
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
