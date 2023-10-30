"use client";
import React, { FC, useEffect, useReducer } from "react";
import { ConnectionConfigContext } from "./connectionConfigContext";
import { useConnectionConfig, useConnectionConfigActions } from "./hooks";
import localRepository from "./localRepository";
import { connectionConfigReducer, initialState } from "./reducer";
import { ConnectionConfigProviderProps } from "./types";

const ConnectionConfigProvider: FC<ConnectionConfigProviderProps> = ({
    children,
    repository = localRepository,
}) => {
    const [state, dispatch] = useReducer(connectionConfigReducer, initialState);
    const store = React.useMemo(
        () => ({ state, dispatch, repository: localRepository }),
        [state],
    );

    useEffect(() => {
        repository
            .list()
            .then((connections) =>
                dispatch({
                    type: "SET_CONNECTIONS",
                    payload: connections,
                }),
            )
            .catch((reason) =>
                console.error(`Error trying to fetch connections: ${reason}`),
            );
    }, []);

    return (
        <ConnectionConfigContext.Provider value={store}>
            {children}
        </ConnectionConfigContext.Provider>
    );
};

export {
    ConnectionConfigProvider,
    useConnectionConfig,
    useConnectionConfigActions,
};
