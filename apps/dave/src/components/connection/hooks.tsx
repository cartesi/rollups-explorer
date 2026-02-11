"use client";
import { join, map, pipe, prop } from "ramda";
import { useContext, useMemo } from "react";
import {
    ConnectionActionContext,
    ConnectionStateContext,
} from "./ConnectionContexts";
import type { NodeConnectionConfig } from "./types";

type ActionLifecycle = {
    onSuccess?: () => void;
    onFailure?: (reason?: unknown) => void;
    onFinished?: () => void;
};

const useConnectionState = () => {
    return useContext(ConnectionStateContext);
};

const useConnectionRepository = () => {
    const state = useConnectionState();
    return useMemo(() => state.repository, [state.repository]);
};

const keyGen: (connections: NodeConnectionConfig[]) => string = pipe(
    map(prop("id")),
    join("/"),
);

const useGetConnections = () => {
    const { connections } = useConnectionState();
    const key = keyGen(connections);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => connections, [key]);
};

const useNodeConnectionActions = () => {
    const repository = useConnectionRepository();
    const dispatch = useContext(ConnectionActionContext);

    return useMemo(
        () => ({
            openConnectionModal: () => dispatch({ type: "open_modal" }),
            closeConnectionModal: () => dispatch({ type: "close_modal" }),
            addConnection: (
                newConn: NodeConnectionConfig,
                opt?: ActionLifecycle,
            ) => {
                repository
                    .add(newConn)
                    .then((connection) => {
                        dispatch({
                            type: "add_connection",
                            payload: { connection },
                        });
                        opt?.onSuccess?.();
                    })
                    .catch((reason) => {
                        console.error(reason);
                        opt?.onFailure?.(reason);
                    })
                    .finally(() => opt?.onFinished?.());
            },
            removeConnection: (id: number, opt?: ActionLifecycle) => {
                repository
                    .remove(id)
                    .then((isDeleted) => {
                        if (isDeleted) {
                            dispatch({
                                type: "remove_connection",
                                payload: { id },
                            });
                            opt?.onSuccess?.();
                        } else {
                            opt?.onFailure?.(
                                `Connection ${id} was not removed`,
                            );
                        }
                    })
                    .catch((reason) => {
                        console.error(reason);
                        opt?.onFailure?.(reason);
                    });
            },

            setSelectedConnection: (connection: NodeConnectionConfig) =>
                dispatch({
                    type: "set_selected_connection",
                    payload: { connection },
                }),
        }),
        [dispatch, repository],
    );
};

/**
 * Retrieve the selected node connection to be used
 * based on ConnectionProvider data information
 * @returns
 */
export const useSelectedNodeConnection = () => {
    const state = useConnectionState();
    return useMemo(() => state.selectedConnection, [state.selectedConnection]);
};

export const useNodeConnection = () => {
    const connections = useGetConnections();
    const selectedConnection = useSelectedNodeConnection();
    const actions = useNodeConnectionActions();
    const getConnection = (id: number) =>
        connections.find((value) => value.id === id);
    const listConnections = () => connections;
    const getSelectedConnection = () => selectedConnection;

    return {
        getSelectedConnection,
        getConnection,
        listConnections,
        ...actions,
    };
};
