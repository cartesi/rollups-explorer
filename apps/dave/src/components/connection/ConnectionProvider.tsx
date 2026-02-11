"use client";
import { useRouter } from "next/navigation";
import { isNotNilOrEmpty } from "ramda-adjunct";
import { useEffect, useReducer, type FC, type ReactNode } from "react";
import { useAppConfig } from "../../providers/AppConfigProvider";
import { pathBuilder } from "../../routes/routePathBuilder";
import PageLoader from "../layout/PageLoader";
import {
    ConnectionActionContext,
    ConnectionStateContext,
    initState,
} from "./ConnectionContexts";
import IndexedDbRepository from "./indexedDbRepository";
import reducer from "./reducer";
import type { NodeConnectionConfig, Repository } from "./types";

const indexedDbRepository = new IndexedDbRepository();

interface ConnectionProviderProps {
    children: ReactNode;
    repository?: Repository;
}

const defaultVal = {
    id: Number.MAX_SAFE_INTEGER,
    chain: undefined,
    isDeletable: false,
    isPreferred: true,
    timestamp: Date.now(),
    version: "v2.0.0-alpha.9",
};

const useSystemNodeConnection = (
    cartesiNodeRpcUrl: string,
    isMockEnabled: boolean,
): NodeConnectionConfig | null => {
    if (isMockEnabled) {
        return {
            ...defaultVal,
            name: "mocked-system-setup",
            type: "system_mock",
            url: "local://in-memory",
        };
    }

    if (isNotNilOrEmpty(cartesiNodeRpcUrl)) {
        return {
            ...defaultVal,
            name: "system-set-node-rpc",
            type: "system",
            url: cartesiNodeRpcUrl,
        };
    }

    return null;
};

const getPreferredNodeConnection = (
    userConnections: NodeConnectionConfig[],
    systemConnection: NodeConnectionConfig | null,
) => {
    const conn = userConnections.find((config) => config.isPreferred);
    return conn ?? systemConnection;
};

export const ConnectionProvider: FC<ConnectionProviderProps> = ({
    children,
    repository = indexedDbRepository,
}) => {
    const [state, dispatch] = useReducer(reducer, repository, initState);
    const { cartesiNodeRpcUrl, isMockEnabled } = useAppConfig();
    const router = useRouter();
    const systemConnection = useSystemNodeConnection(
        cartesiNodeRpcUrl,
        isMockEnabled,
    );

    useEffect(() => {
        dispatch({
            type: "set_fetching",
            payload: true,
        });
        repository
            .list()
            .then((connections) => {
                const preferredConnection = getPreferredNodeConnection(
                    connections,
                    systemConnection,
                );

                dispatch({
                    type: "set_connections",
                    payload: { connections },
                });

                if (null !== preferredConnection) {
                    dispatch({
                        type: "set_selected_connection",
                        payload: { connection: preferredConnection },
                    });
                }

                if (null !== systemConnection) {
                    dispatch({
                        type: "set_system_connection",
                        payload: { connection: systemConnection },
                    });
                }
            })
            .catch((err) =>
                console.error(
                    `Error trying to fetch connections: ${err.message}`,
                ),
            )
            .finally(() =>
                dispatch({
                    type: "set_fetching",
                    payload: false,
                }),
            );
    }, [repository]);

    useEffect(() => {
        // when the selected-connection change we route the user back to home page.
        if (state.selectedConnection !== null) router.push(pathBuilder.base);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.selectedConnection]);

    if (state.fetching) {
        return <PageLoader />;
    }

    return (
        <ConnectionStateContext value={state}>
            <ConnectionActionContext value={dispatch}>
                {children}
            </ConnectionActionContext>
        </ConnectionStateContext>
    );
};
