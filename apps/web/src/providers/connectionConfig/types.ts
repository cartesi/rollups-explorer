import { Dispatch } from "react";
import { Address } from "viem";

export interface Repository {
    add: (conn: Connection) => Promise<Connection>;
    remove: (addr: Address) => Promise<boolean>;
    has: (addr: Address) => Promise<boolean>;
    get: (addr: Address) => Promise<Connection | null>;
    list: () => Promise<Connection[]>;
}

export interface IndexedDbRepository<T> extends Repository {
    db: T | null;
    connect: () => Promise<T>;
    initialize: () => Promise<void>;
}

export interface Connection {
    url: string;
    address: Address;
    timestamp?: number;
}

export interface Entry {
    [k: Address]: Connection;
}

export interface Config {
    [k: string]: Entry;
}

export type SetConnections = {
    type: "SET_CONNECTIONS";
    payload: Connection[];
};

export type SetFetching = {
    type: "SET_FETCHING";
    payload: boolean;
};

export type AddConnection = {
    type: "ADD_CONNECTION";
    payload: { connection: Connection };
};

export type RemoveConnection = {
    type: "REMOVE_CONNECTION";
    payload: { address: Address };
};

export type ShowConnectionModal = {
    type: "SHOW_CONNECTION_MODAL";
    payload?: {
        address: Address;
    };
};

export type HideConnectionModal = {
    type: "HIDE_CONNECTION_MODAL";
};

export interface State {
    /** list of connections */
    connections: Connection[];
    /** controls visibility of the modal */
    showConnectionModal: boolean;
    /** work in conjunction with the creation modal.
     * When available it should pre-fill the form.*/
    connectionAddress?: Address;
    fetching: boolean;
}
export type Action =
    | SetConnections
    | AddConnection
    | RemoveConnection
    | ShowConnectionModal
    | HideConnectionModal
    | SetFetching;

export type ContextProps = {
    state: State;
    dispatch: Dispatch<Action>;
    repository: Repository;
};

export type Predicate<R> = (p: State) => R;
export type UseSelector = <R>(p: Predicate<R>) => R;

export type Reducer = (state: State, action: Action) => State;
