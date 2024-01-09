import { FC, ReactNode } from "react";
import { Provider } from "urql";
import { getUrqlClient } from "../lib/urql";

export type GraphQLProviderProps = {
    children?: ReactNode;
};

const GraphQLProvider: FC<GraphQLProviderProps> = (props) => {
    // TODO: change according to selected chain
    const client = getUrqlClient();
    return <Provider value={client}>{props.children}</Provider>;
};

export default GraphQLProvider;
