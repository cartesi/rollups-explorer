"use client";
import { Modal } from "@mantine/core";
import React, { FC, useEffect, useReducer } from "react";
import AppConnectionForm from "../../components/connection/connectionForm";
import { ConnectionConfigContext } from "./connectionConfigContext";
import { useConnectionConfig, useConnectionConfigActions } from "./hooks";
import { connectionConfigReducer, initialState } from "./reducer";
import { ConnectionConfigProviderProps } from "./types";
import localRepository from "./localRepository";

const ConnectionConfigProvider: FC<ConnectionConfigProviderProps> = ({
    children,
    repository = localRepository,
}) => {
    const [state, dispatch] = useReducer(connectionConfigReducer, initialState);
    const store = React.useMemo(
        () => ({ state, dispatch, repository }),
        [state, repository],
    );

    const closeModal = () => dispatch({ type: "HIDE_CONNECTION_MODAL" });

    useEffect(() => {
        dispatch({
            type: "SET_FETCHING",
            payload: true,
        });
        repository
            .list()
            .then((connections) => {
                dispatch({
                    type: "SET_CONNECTIONS",
                    payload: connections,
                });
            })
            .catch((err) => {
                console.error(`Error trying to fetch connections: ${err}`);
            })
            .finally(() => {
                dispatch({
                    type: "SET_FETCHING",
                    payload: false,
                });
            });
    }, [repository]);

    return (
        <ConnectionConfigContext.Provider value={store}>
            {children}
            <Modal
                opened={state.showConnectionModal}
                onClose={closeModal}
                title="Create App Connection"
                closeOnClickOutside={false}
            >
                <AppConnectionForm
                    onSubmitted={closeModal}
                    application={state.connectionAddress}
                />
            </Modal>
        </ConnectionConfigContext.Provider>
    );
};

export {
    ConnectionConfigProvider,
    useConnectionConfig,
    useConnectionConfigActions,
};
