import { FC, ReactNode, createContext, useContext } from "react";

export interface AppConfigContextProps {
    apiEndpoint?: string;
    nodeRpcUrl?: string;
}

interface AppConfigProviderProps {
    children: ReactNode;
    value: AppConfigContextProps;
}

const AppConfigContext = createContext<AppConfigContextProps>({});

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
