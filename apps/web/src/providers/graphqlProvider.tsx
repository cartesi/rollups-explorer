import { Provider } from "@cartesi/rollups-explorer-domain";
import { FC, ReactNode } from "react";
import { getUrqlClient } from "../lib/urql";
import { useAppConfig } from "./appConfigProvider";

export type GraphQLProviderProps = {
    children?: ReactNode;
};

const GraphQLProvider: FC<GraphQLProviderProps> = (props) => {
    const appConfig = useAppConfig();
    const client = getUrqlClient(appConfig.apiEndpoint ?? "");
    return <Provider value={client}>{props.children}</Provider>;
};

export default GraphQLProvider;
