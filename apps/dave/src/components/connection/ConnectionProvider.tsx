"use client";
import { Button, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useReducer, useRef, type FC, type ReactNode } from "react";
import { pathBuilder } from "../../routes/routePathBuilder";
import {
    ConnectionActionContext,
    ConnectionStateContext,
    initState,
    type ConnectionState,
} from "./ConnectionContexts";
import { useCheckNodeConnection } from "./hooks";
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

const getSelectedConfig = (
    state: ConnectionState,
): DbNodeConnectionConfig | null => {
    return state.connections[state.selectedConnection ?? -1] ?? null;
};

const ConnectivityProblem: FC<{ message: string; onClick: () => void }> = ({
    message,
    onClick,
}) => {
    return (
        <Stack>
            <Text size="sm" fw="bold">
                {message}
            </Text>
            <Group>
                <Button onClick={onClick} size="compact-md">
                    <Text tt="uppercase">manage</Text>
                </Button>
            </Group>
        </Stack>
    );
};

export const ConnectionProvider: FC<ConnectionProviderProps> = ({
    children,
    systemConnection,
    repository = indexedDbRepository,
}) => {
    const [state, dispatch] = useReducer(reducer, repository, initState);

    const router = useRouter();
    const prev = useRef(state.selectedConnection);
    const selectedConfig = getSelectedConfig(state);
    const [result] = useCheckNodeConnection(selectedConfig);

    useEffect(() => {
        dispatch({
            type: "set_fetching",
            payload: true,
        });
        repository
            .list()
            .then((userConnections) => {
                const preferredConnection = getPreferredNodeConnection(
                    userConnections,
                    systemConnection,
                );

                if (null !== systemConnection) {
                    dispatch({
                        type: "set_system_connection",
                        payload: { connection: systemConnection },
                    });
                }

                dispatch({
                    type: "set_connections",
                    payload: { connections: userConnections },
                });

                if (null !== preferredConnection) {
                    dispatch({
                        type: "set_selected_connection",
                        payload: { id: preferredConnection.id! },
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

    useEffect(() => {
        if (null !== prev.current && result.status === "error") {
            notifications.show({
                id: prev.current.toString(),
                color: "red",
                autoClose: false,
                title: "Connectivity problem!",
                message: (
                    <ConnectivityProblem
                        message={
                            result.error?.message ?? "Something went wrong!"
                        }
                        onClick={() => dispatch({ type: "open_modal" })}
                    />
                ),
            });
        }
    }, [result]);

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
