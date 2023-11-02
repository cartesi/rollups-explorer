"use client";
import {
    find,
    identity,
    join,
    map,
    memoizeWith,
    pathOr,
    pipe,
    prop,
    propEq,
} from "ramda";
import { useContext } from "react";
import { Address, isAddress } from "viem";
import { ConnectionConfigContext } from "./connectionConfigContext";
import { Action, Connection, State, UseSelector } from "./types";

const useSelector: UseSelector = (predicate) => {
    const state = useConnectionConfigState();
    const result = predicate(state);

    return result;
};

const useConnectionConfigState = () => {
    const ctx = useContext(ConnectionConfigContext);
    return ctx.state;
};

const useConnectionConfigDispatcher = () => {
    const ctx = useContext(ConnectionConfigContext);
    return ctx.dispatch;
};

const useConnectionRepository = () => {
    const ctx = useContext(ConnectionConfigContext);
    return ctx.repository;
};

type ActionLifecycle = {
    onSuccess?: () => void;
    onFailure?: () => void;
    onFinished: () => void;
};

const useConnectionConfigActions = () => {
    const dispatch = useConnectionConfigDispatcher();
    const repository = useConnectionRepository();
    const actions = {
        showConnectionModal(address?: Address) {
            const action: Action = { type: "SHOW_CONNECTION_MODAL" };
            if (address && isAddress(address)) {
                action.payload = { address };
            }
            dispatch(action);
        },
        hideConnectionModal() {
            dispatch({ type: "HIDE_CONNECTION_MODAL" });
        },
        addConnection(connection: Connection, opt?: ActionLifecycle) {
            repository
                .add(connection)
                .then(() => {
                    dispatch({
                        type: "ADD_CONNECTION",
                        payload: { connection },
                    });

                    opt?.onSuccess && opt?.onSuccess();
                })
                .catch((reason) => {
                    console.error(
                        `Problem trying to persist/add connection: ${reason}`,
                    );

                    opt?.onFailure && opt.onFailure();
                })
                .finally(() => opt?.onFinished && opt.onFinished());
        },
        removeConnection(address: Address, opt?: ActionLifecycle) {
            repository
                .remove(address)
                .then(() => {
                    dispatch({
                        type: "REMOVE_CONNECTION",
                        payload: { address },
                    });

                    opt?.onSuccess && opt?.onSuccess();
                })
                .catch((reason) => {
                    console.error(
                        `Problem trying to remove connection: ${reason}`,
                    );

                    opt?.onFailure && opt?.onFailure();
                })
                .finally(() => opt?.onFinished && opt.onFinished());
        },
    };

    return actions;
};

const keyGen: (connections: Connection[]) => string = pipe(
    map(prop("address")),
    join("/"),
);
const cache = memoizeWith(keyGen, identity<Connection[]>);

const getConnections: (state: State) => Connection[] = pipe(
    pathOr([], ["connections"]),
    cache,
);

const useConnectionConfig = () => {
    const connections = useSelector(getConnections);
    const {
        addConnection,
        removeConnection,
        hideConnectionModal,
        showConnectionModal,
    } = useConnectionConfigActions();
    const getConnection = (addr: Address) =>
        find(propEq(addr, "address"), connections);
    const hasConnection = (addr: Address) => getConnection(addr) !== undefined;
    const listConnections = () => connections;

    return {
        listConnections,
        getConnection,
        hasConnection,
        addConnection,
        removeConnection,
        hideConnectionModal,
        showConnectionModal,
    };
};

export { useConnectionConfig, useConnectionConfigActions };
