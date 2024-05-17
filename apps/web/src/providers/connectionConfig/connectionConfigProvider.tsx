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

type IndexedDbRepositoryType = IndexedDbRepository<ConnectionsDb>;

const hasInitialize = (item: any): item is IndexedDbRepositoryType => {
    return "initialize" in item && typeof item.initialize === "function";
};

export interface ConnectionConfigProviderProps {
    children: ReactNode;
    repository: Repository | IndexedDbRepositoryType;
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
        init()
            .then((connections) => {
                dispatch({
                    type: "SET_CONNECTIONS",
                    payload: connections,
                });
            })
            .catch((err) => {
                console.error(`Error trying to fetch connections: ${err}`);
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
