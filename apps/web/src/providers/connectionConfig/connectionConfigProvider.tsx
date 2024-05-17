"use client";
import { Modal } from "@mantine/core";
import React, {
    FC,
    ReactNode,
    useCallback,
    useEffect,
    useReducer,
} from "react";
import AppConnectionForm from "../../components/connection/connectionForm";
import { ConnectionConfigContext } from "./connectionConfigContext";
import { useConnectionConfig, useConnectionConfigActions } from "./hooks";
import { connectionConfigReducer, initialState } from "./reducer";
import { IndexedDbRepository, Repository } from "./types";
import { ConnectionsDb } from "./indexedDbRepository";
import { hasInitialize } from "./utils";

export interface ConnectionConfigProviderProps {
    children: ReactNode;
    repository: Repository | IndexedDbRepository<ConnectionsDb>;
}

const ConnectionConfigProvider: FC<ConnectionConfigProviderProps> = ({
    children,
    repository,
}) => {
    const [state, dispatch] = useReducer(connectionConfigReducer, initialState);
    const store = React.useMemo(
        () => ({ state, dispatch, repository }),
        [state, repository],
    );

    const closeModal = () => dispatch({ type: "HIDE_CONNECTION_MODAL" });

    const init = useCallback(async () => {
        if (hasInitialize(repository)) {
            await repository.initialize();
        }

        return await repository.list();
    }, [repository]);

    useEffect(() => {
        dispatch({
            type: "SET_FETCHING",
            payload: true,
        });
        init()
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
    }, [init]);

    return (
        <ConnectionConfigContext.Provider value={store}>
            {children}
            <Modal
                opened={state.showConnectionModal}
                onClose={closeModal}
                title="Create App Connection"
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
