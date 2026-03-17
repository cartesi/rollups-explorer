import { Card } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useReducer, type FC, type ReactNode } from "react";
import {
    ConnectionActionContext,
    ConnectionStateContext,
    initState,
    type ConnectionState,
} from "../connection/ConnectionContexts";
import IndexedDbRepository from "../connection/indexedDbRepository";
import reducer from "../connection/reducer";
import type { DbNodeConnectionConfig } from "../connection/types";
import { ConnectionSettings } from "./ConnectionSettings";

const meta = {
    title: "Components/Settings/ConnectionSettings",
    component: ConnectionSettings,
    parameters: {
        layout: "centered",
    },
} satisfies Meta<typeof ConnectionSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

const repository = new IndexedDbRepository();

const createState = (overrides: Partial<ConnectionState>) => {
    const defaultState = initState(repository);
    return Object.assign(defaultState, overrides);
};

const validConnection: DbNodeConnectionConfig = {
    chain: {
        id: 31337,
        rpcUrl: "http://localhost:6751/anvil",
    },
    id: 1,
    isDeletable: true,
    isPreferred: true,
    name: "Storybook-setup",
    timestamp: Date.now(),
    type: "user",
    url: "http://localhost:6751/rpc",
    version: "2.0.0-alpha.9",
};

const SimpleConnProvider: FC<{
    initState: ConnectionState;
    children: ReactNode;
}> = ({ children, initState }) => {
    const [state, dispatch] = useReducer(reducer, initState);

    return (
        <ConnectionStateContext value={state}>
            <ConnectionActionContext value={dispatch}>
                {children}
            </ConnectionActionContext>
        </ConnectionStateContext>
    );
};

export const Default: Story = {
    args: {
        onClick() {
            alert("Clicked managed button!");
        },
    },
    render: (props) => (
        <SimpleConnProvider
            initState={createState({
                connections: { [validConnection.id]: validConnection },
                systemConnection: validConnection,
                fetching: false,
                selectedConnection: 1,
            })}
        >
            <Card>
                <ConnectionSettings onClick={props.onClick} />
            </Card>
        </SimpleConnProvider>
    ),
};
