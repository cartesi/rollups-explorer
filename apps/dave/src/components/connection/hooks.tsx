"use client";
import { createCartesiPublicClient } from "@cartesi/viem";
import { join, map, pipe, prop } from "ramda";
import { useContext, useEffect, useMemo, useState } from "react";
import { http } from "wagmi";
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
