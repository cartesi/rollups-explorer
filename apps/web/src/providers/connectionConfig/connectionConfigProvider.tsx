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
import { AsyncRepository, Repository } from "./types";
import { ConnectionsDb } from "./asyncRepository";

type AsyncRepositoryType = AsyncRepository<ConnectionsDb>;

const isAsyncRepository = (item: any): item is AsyncRepositoryType => {
    return "initialize" in item;
};

export interface ConnectionConfigProviderProps {
    children: ReactNode;
    repository: Repository | AsyncRepositoryType;
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

    useEffect(() => {
        console.log("repository::", repository);
    }, [repository]);

    const closeModal = () => dispatch({ type: "HIDE_CONNECTION_MODAL" });

    const init = useCallback(async () => {
        if (isAsyncRepository(repository)) {
            await repository.initialize();
        }

        try {
            const connections = await repository.list();
            dispatch({
                type: "SET_CONNECTIONS",
                payload: connections,
            });
        } catch (err) {
            console.error(`Error trying to fetch connections: ${err}`);
        }
    }, [repository]);

    useEffect(() => {
        init();
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
