"use client";
import { path, pathOr } from "ramda";
import { isNotNilOrEmpty } from "ramda-adjunct";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supportedChains } from "../../lib/supportedChains";
import { useAppConfig } from "../../providers/AppConfigProvider";
import {
    ConnectionActionContext,
    ConnectionStateContext,
} from "./ConnectionContexts";
import { fetchRollupsNodeMeta, sortByTimestampDesc } from "./functions";
import type IndexedDbRepository from "./indexedDbRepository";
import type {
    ConnectionNetworkStatus,
    DbNodeConnectionConfig,
    NodeConnectionConfig,
} from "./types";

export type NodeInformationResult =
    | {
          status: "success";
          data: { chainId: number; nodeVersion: string };
      }
    | {
          status: "error";
          error: Error;
      }
    | {
          status: Exclude<ConnectionNetworkStatus, "success" | "error">;
      };

export type GetNodeInformationResult = [
    result: NodeInformationResult,
    retry: () => void,
];

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
            updateIsPreferred: async (
                params: {
                    newValue: boolean;
                    connection: DbNodeConnectionConfig;
                },
                opt?: ActionLifecycle,
            ) => {
                // casting for raw access.
                const db = repository as IndexedDbRepository;
                try {
                    const modifyCount = await db.connections
                        .toCollection()
                        .modify({ isPreferred: false });
                    console.info(`Modified ${modifyCount} entries`);
                    const updateResult = await db.connections.update(
                        params.connection.id,
                        { isPreferred: params.newValue },
                    );
                    console.info(
                        `Connection id ${params.connection.id} ${updateResult === 0 ? "was not" : "was"} updated!`,
                    );

                    if (updateResult === 1) {
                        const newList = await repository.list();
                        dispatch({
                            type: "set_connections",
                            payload: { connections: newList },
                        });
                        opt?.onSuccess?.();
                    } else {
                        opt?.onFailure?.(
                            new Error("The connection could not be updated."),
                        );
                    }
                } catch (error) {
                    console.error(error);
                    opt?.onFailure?.(
                        pathOr(
                            "Something went wrong when trying to update the connection",
                            ["message"],
                            error,
                        ),
                    );
                } finally {
                    opt?.onFinished?.();
                }
            },
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

    const functions = useMemo(() => {
        const getConnection = (id: number) => connections[id];
        const listConnections = () =>
            sortByTimestampDesc(Object.values(connections));
        const getSelectedConnection = () =>
            getConnection(selectedConnection ?? -1);
        const hasChainRegistered = (chainId: number) =>
            listConnections().some((conn) => conn.chain.id === chainId);
        const countConnectionSameChainDiffRpc = (
            chainId: number,
            rpcUrl: string,
        ) =>
            listConnections().filter(
                (conn) =>
                    conn.chain.id === chainId &&
                    conn.chain.rpcUrl.toLowerCase() !== rpcUrl.toLowerCase(),
            ).length;

        return {
            getConnection,
            listConnections,
            getSelectedConnection,
            hasChainRegistered,
            countConnectionSameChainDiffRpc,
        };
    }, [connections, selectedConnection]);

    return {
        getSelectedConnection: functions.getSelectedConnection,
        getConnection: functions.getConnection,
        hasChainRegistered: functions.hasChainRegistered,
        listConnections: functions.listConnections,
        countConnectionSameChainDiffRpc:
            functions.countConnectionSameChainDiffRpc,
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
export const useGetNodeInformation = (
    cartesiNodeUrl: string | null,
): GetNodeInformationResult => {
    const [toRetry, setToRetry] = useState<number>(0);
    const [result, setResult] = useState<NodeInformationResult>({
        status: "idle",
    });

    const retry = useCallback(() => {
        setToRetry(Date.now());
    }, [setToRetry]);

    useEffect(() => {
        if (!cartesiNodeUrl) {
            setResult({ status: "noop" });
            return;
        }

        setResult({ status: "pending" });

        const abortController = new AbortController();

        fetchRollupsNodeMeta(cartesiNodeUrl).then((result) => {
            if (abortController.signal.aborted) return;

            if (result.status === "success") {
                setResult({
                    status: "success",
                    data: {
                        chainId: result.chainId,
                        nodeVersion: result.nodeVersion,
                    },
                });
            } else if (result.status === "error") {
                setResult({ status: "error", error: result.error });
            } else {
                console.warn(`Unhandled rollusp-node-meta result ${result}`);
            }
        });

        return () => {
            abortController.abort(
                `The cartesi rollups node's url changed. Ignoring responses from ${cartesiNodeUrl}`,
            );
            setResult({ status: "idle" });
        };
    }, [cartesiNodeUrl, toRetry]);

    return [result, retry];
};

type NodeConnectionResult = {
    status: ConnectionNetworkStatus;
    matchVersion?: boolean;
    matchChain?: boolean;
    error?: Error;
    response?: {
        chainId: number;
        nodeVersion: string;
    };
};

export type CheckNodeConnectionReturn = [
    result: NodeConnectionResult,
    retry: () => void,
];

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
    config?: DbNodeConnectionConfig | null,
): CheckNodeConnectionReturn => {
    const [toRetry, setToRetry] = useState<number>(0);
    const [result, setResult] = useState<NodeConnectionResult>({
        status: "idle",
    });

    const retry = useCallback(() => setToRetry(Date.now()), [setToRetry]);

    useEffect(() => {
        if (!config?.url) {
            setResult({ status: "noop" });
            return;
        }

        if (config.type === "system_mock") {
            setResult({
                status: "success",
                matchChain: true,
                matchVersion: true,
                response: {
                    chainId: config.chain.id,
                    nodeVersion: config.version,
                },
            });
            return;
        }

        setResult({ status: "pending" });

        const abortController = new AbortController();

        fetchRollupsNodeMeta(config.url).then((result) => {
            if (abortController.signal.aborted) return;

            if (result.status === "success") {
                const { chainId, nodeVersion } = result;
                const matchChain =
                    config.chain?.toString() === chainId.toString();
                const matchVersion = config.version === nodeVersion.toString();

                setResult({
                    status: "success",
                    matchChain,
                    matchVersion,
                    response: {
                        chainId,
                        nodeVersion,
                    },
                });
            } else if (result.status === "error") {
                setResult({ status: "error", error: result.error });
            } else {
                console.warn(`Unhandled rollusp-node-meta result ${result}`);
            }
        });

        return () => {
            abortController.abort(
                `The node connection configuration changed. Ignoring responses from ${config.url}`,
            );
            setResult({ status: "idle" });
        };
    }, [config?.url, config?.chain, config?.version, config?.type, toRetry]);

    return [result, retry];
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
    chain: {
        id: 13370,
        rpcUrl: pathOr(
            "http://localhost:8545",
            ["13370", "rpcUrls", "default", "http", "0"],
            supportedChains,
        ),
    },
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
    const appConfig = useAppConfig();

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
        const rpcUrl =
            appConfig.nodeRpcUrl ??
            path(
                [
                    result.data.chainId.toString(),
                    "rpcUrls",
                    "default",
                    "http",
                    "0",
                ],
                supportedChains,
            );
        return {
            config: {
                ...defaultVal,
                name: "system-set-node-rpc",
                type: "system",
                url: cartesiNodeRpcUrl,
                chain: {
                    id: result.data.chainId,
                    rpcUrl: rpcUrl,
                },
                version: result.data.nodeVersion,
            },
        };
    }

    return { config: null };
};
