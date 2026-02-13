"use client";
import { useRouter } from "next/navigation";
import { isNotNil } from "ramda";
import { useEffect, useReducer, useRef, type FC, type ReactNode } from "react";
import { pathBuilder } from "../../routes/routePathBuilder";
import {
    ConnectionActionContext,
    ConnectionStateContext,
    initState,
} from "./ConnectionContexts";
import IndexedDbRepository from "./indexedDbRepository";
import reducer from "./reducer";
import type { DbNodeConnectionConfig, Repository } from "./types";

const indexedDbRepository = new IndexedDbRepository();

interface ConnectionProviderProps {
    children: ReactNode;
    systemConnection: DbNodeConnectionConfig | null;
    repository?: Repository;
}

const getPreferredNodeConnection = (
    userConnections: DbNodeConnectionConfig[],
    systemConnection: DbNodeConnectionConfig | null,
) => {
    const conn = userConnections.find((config) => config.isPreferred);
    return conn ?? systemConnection;
};

export const ConnectionProvider: FC<ConnectionProviderProps> = ({
    children,
    systemConnection,
    repository = indexedDbRepository,
}) => {
    const [state, dispatch] = useReducer(reducer, repository, initState);
    const router = useRouter();
    const prev = useRef(state.selectedConnection);

    useEffect(() => {
        dispatch({
            type: "set_fetching",
            payload: true,
        });
        repository
            .list()
            .then((nodeConnections) => {
                const preferredConnection = getPreferredNodeConnection(
                    nodeConnections,
                    systemConnection,
                );

                const connections = (
                    isNotNil(systemConnection)
                        ? [...nodeConnections, systemConnection]
                        : nodeConnections
                ) as DbNodeConnectionConfig[];

                dispatch({
                    type: "set_connections",
                    payload: { connections },
                });

                if (null !== preferredConnection) {
                    dispatch({
                        type: "set_selected_connection",
                        payload: { id: preferredConnection.id! },
                    });
                }

                if (null !== systemConnection) {
                    dispatch({
                        type: "set_system_connection",
                        payload: { id: systemConnection.id },
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repository]);

    useEffect(() => {
        // when the selected-connection change we route the user back to home page.
        if (prev.current !== state.selectedConnection) {
            prev.current = state.selectedConnection;
            router.push(pathBuilder.base, { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.selectedConnection]);

    if (state.fetching) {
        return "";
    }

    return (
        <ConnectionStateContext value={state}>
            <ConnectionActionContext value={dispatch}>
                {children}
            </ConnectionActionContext>
        </ConnectionStateContext>
    );
};
