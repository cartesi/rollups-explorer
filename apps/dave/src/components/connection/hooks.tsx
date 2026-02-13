"use client";
import { createCartesiPublicClient } from "@cartesi/viem";
import { isNotNilOrEmpty } from "ramda-adjunct";
import { useContext, useEffect, useMemo, useState } from "react";
import { http } from "wagmi";
import {
    ConnectionActionContext,
    ConnectionStateContext,
} from "./ConnectionContexts";
import { sortByTimestampDesc } from "./functions";
import type { DbNodeConnectionConfig, NodeConnectionConfig } from "./types";

type NetworkStatus = "idle" | "pending" | "error" | "success" | "noop";

type GetNodeInformationResult =
    | {
          status: "success";
          data: { chainId: number; nodeVersion: string };
      }
    | {
          status: "error";
          error: Error;
      }
    | {
          status: Exclude<NetworkStatus, "success" | "error">;
      };

type ActionLifecycle<T = undefined> = {
    onSuccess?: (...params: T extends undefined ? [never?] : [T]) => void;
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

/**
 * Retrieve a dictionary of connections loaded, keys are the ids and value is the
 * node-connection-config.
 * @returns {Record<number, DbNodeConnectionConfig>} Connections dictionary
 */
const useConnectionsMap = () => {
    const state = useConnectionState();
    return state.connections;
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
                opt?: ActionLifecycle<Required<NodeConnectionConfig>>,
            ) => {
                repository
                    .add(newConn)
                    .then((connection) => {
                        dispatch({
                            type: "add_connection",
                            payload: { connection },
                        });
                        opt?.onSuccess?.(connection);
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

            setSelectedConnection: (id: number) =>
                dispatch({
                    type: "set_selected_connection",
                    payload: { id },
                }),
        }),
        [dispatch, repository],
    );
};

/**
 * Retrieve the selected connection id.
 * based on ConnectionProvider data information
 */
const useSelectedConnection = () => {
    const state = useConnectionState();
    return state.selectedConnection;
};

// ###### EXPORTED HOOKS

/**
 * Retrieve the selected node connection instance to be used
 * based on ConnectionProvider data information
 * @returns
 */
export const useSelectedNodeConnection = (): DbNodeConnectionConfig | null => {
    const connections = useConnectionsMap();
    const id = useSelectedConnection();
    return connections[id ?? -1] ?? null;
};

export const useNodeConnection = () => {
    const connections = useConnectionsMap();
    const selectedConnection = useSelectedConnection();
    const actions = useNodeConnectionActions();
    const getConnection = (id: number) => connections[id];
    const listConnections = () =>
        sortByTimestampDesc(Object.values(connections));
    const getSelectedConnection = () => getConnection(selectedConnection ?? -1);

    return {
        getSelectedConnection,
        getConnection,
        listConnections,
        ...actions,
    };
};

/**
 * This is meant to provide fresh cartesi-client
 * avoiding any possible cartesi-provider that may or not be available.
 * It will fetch the rollups-node chain-id and node-version of the
 * url defined. If URL is nil a noop is returned.
 * @param cartesiNodeUrl
 */
export const useGetNodeInformation = (cartesiNodeUrl: string | null) => {
    const [result, setResult] = useState<GetNodeInformationResult>({
        status: "idle",
    });

    useEffect(() => {
        console.count("check-node-connection");

        if (!cartesiNodeUrl) {
            setResult({ status: "noop" });
            return;
        }

        setResult({ status: "pending" });

        const abortController = new AbortController();

        const cartesiClient = createCartesiPublicClient({
            transport: http(cartesiNodeUrl),
        });

        const promises = [
            cartesiClient.getChainId(),
            cartesiClient.getNodeVersion(),
        ];

        Promise.allSettled(promises).then(
            ([chainIdSettled, nodeVersionSettled]) => {
                if (abortController.signal.aborted) {
                    console.log(abortController.signal.reason);
                    return;
                }

                const bothFailed =
                    chainIdSettled.status === "rejected" &&
                    nodeVersionSettled.status === "rejected";
                if (bothFailed) {
                    setResult({
                        status: "error",
                        error: new Error(
                            "Looks like the node is not responding.",
                        ),
                    });
                } else {
                    const nodeVersion =
                        nodeVersionSettled.status === "fulfilled"
                            ? nodeVersionSettled.value
                            : "";
                    const chainId =
                        chainIdSettled.status === "fulfilled"
                            ? chainIdSettled.value
                            : "";

                    setResult({
                        status: "success",
                        data: {
                            chainId: chainId as number,
                            nodeVersion: nodeVersion as string,
                        },
                    });
                }
            },
        );

        return () => {
            abortController.abort(
                `The cartesi rollups node's url changed. Ignoring responses from ${cartesiNodeUrl}`,
            );
            setResult({ status: "idle" });
        };
    }, [cartesiNodeUrl]);

    return result;
};

interface CheckNodeConnectionReturn {
    status: NetworkStatus;
    matchVersion?: boolean;
    matchChain?: boolean;
    error?: Error;
    response?: {
        chainId: number;
        nodeVersion: string;
    };
}

/**
 * Based on a node-connection-configuration
 * Checks if the target node-rollups-rpc-api is still running,
 * and, checks if the node-version and chain-id in the configuration
 * matches with the response results. It is up to the caller
 * to define what to do next.
 * @param config
 * @returns
 */
export const useCheckNodeConnection = (
    config?: NodeConnectionConfig | null,
): CheckNodeConnectionReturn => {
    const [result, setResult] = useState<CheckNodeConnectionReturn>({
        status: "idle",
    });

    useEffect(() => {
        console.count("check-node-connection");

        if (!config?.url) {
            setResult({ status: "noop" });
            return;
        }

        if (config.type === "system_mock") {
            setResult({
                status: "success",
                matchChain: true,
                matchVersion: true,
            });
            return;
        }

        setResult({ status: "pending" });

        const abortController = new AbortController();

        const cartesiClient = createCartesiPublicClient({
            transport: http(config.url),
        });

        const promises = [
            cartesiClient.getChainId(),
            cartesiClient.getNodeVersion(),
        ];

        Promise.allSettled(promises).then(
            ([chainIdSettled, nodeVersionSettled]) => {
                if (abortController.signal.aborted) {
                    console.log(abortController.signal.reason);
                    return;
                }

                const bothFailed =
                    chainIdSettled.status === "rejected" &&
                    nodeVersionSettled.status === "rejected";
                if (bothFailed) {
                    setResult({
                        status: "error",
                        error: new Error(
                            "Looks like the node is not responding.",
                        ),
                    });
                } else {
                    const nodeVersion =
                        nodeVersionSettled.status === "fulfilled"
                            ? nodeVersionSettled.value
                            : "";
                    const chainId =
                        chainIdSettled.status === "fulfilled"
                            ? chainIdSettled.value
                            : "";

                    setResult({
                        status: "success",
                        matchChain:
                            config.chain?.toString() === chainId.toString(),
                        matchVersion: config.version === nodeVersion.toString(),
                        response: {
                            chainId: chainId as number,
                            nodeVersion: nodeVersion as string,
                        },
                    });
                }
            },
        );

        return () => {
            abortController.abort(
                `The node connection configuration changed. Ignoring responses from ${config.url}`,
            );
            setResult({ status: "idle" });
        };
    }, [config?.url, config?.chain, config?.version, config?.type]);

    return result;
};

export const useShowConnectionModal = () => {
    const state = useConnectionState();
    return useMemo(
        () => state.showConnectionModal,
        [state.showConnectionModal],
    );
};

export const useSystemConnection = () => {
    const state = useConnectionState();
    return useMemo(() => state.systemConnection, [state.systemConnection]);
};

const defaultVal = {
    id: Number.MAX_SAFE_INTEGER,
    chain: 13370,
    isDeletable: false,
    isPreferred: true,
    timestamp: Date.now(),
    version: "2.0.0-alpha.9",
};

type BuildSystemNodeReturn = {
    config: DbNodeConnectionConfig | null;
    isFetching?: boolean;
};

/**
 * @description For internal use. It builds a system-node-connection based on parameters
 * For internal use
 * @param cartesiNodeRpcUrl
 * @param isMockEnabled
 * @returns
 */
export const useBuildSystemNodeConnection = (
    cartesiNodeRpcUrl: string,
    isMockEnabled: boolean,
): BuildSystemNodeReturn => {
    const url = isMockEnabled ? null : cartesiNodeRpcUrl;
    const result = useGetNodeInformation(url);

    if (isMockEnabled) {
        return {
            config: {
                ...defaultVal,
                name: "mocked-system-setup",
                type: "system_mock",
                url: "local://in-memory",
            },
        };
    }

    if (result.status === "pending") {
        return { config: null, isFetching: true };
    }

    if (isNotNilOrEmpty(cartesiNodeRpcUrl) && result.status === "success") {
        return {
            config: {
                ...defaultVal,
                name: "system-set-node-rpc",
                type: "system",
                url: cartesiNodeRpcUrl,
                chain: result.data.chainId,
                version: result.data.nodeVersion,
            },
        };
    }

    return { config: null };
};
