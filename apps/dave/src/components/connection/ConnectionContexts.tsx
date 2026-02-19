"use client";
import { createContext, type ActionDispatch } from "react";
import type { ViewControl } from "./ConnectionModal";
import IndexedDbRepository from "./indexedDbRepository";
import type { DbNodeConnectionConfig, Repository } from "./types";

// Actions
type CloseModal = { type: "close_modal" };
type OpenModal = { type: "open_modal"; payload?: ViewControl };
type SetFetching = { type: "set_fetching"; payload: boolean };
type AddConnection = {
    type: "add_connection";
    payload: { connection: DbNodeConnectionConfig };
};
type RemoveConnection = { type: "remove_connection"; payload: { id: number } };
type SetSelectedConnection = {
    type: "set_selected_connection";
    payload: { id: number };
};
type SetSystemConnection = {
    type: "set_system_connection";
    payload: { connection: DbNodeConnectionConfig };
};
type SetConnections = {
    type: "set_connections";
    payload: { connections: DbNodeConnectionConfig[] };
};

export type ConnectionState = {
    systemConnection: DbNodeConnectionConfig | null;
    selectedConnection: number | null;
    repository: Repository;
    connections: Record<number, DbNodeConnectionConfig>;
    showConnectionModal: boolean;
    connectionModalMode: ViewControl;
    fetching: boolean;
};

export type ConnectionAction =
    | SetSelectedConnection
    | CloseModal
    | OpenModal
    | SetFetching
    | AddConnection
    | RemoveConnection
    | SetConnections
    | SetSystemConnection;

export type ConnectionReducer = (
    state: ConnectionState,
    action: ConnectionAction,
) => ConnectionState;

export const initState = (repository: Repository): ConnectionState => {
    return {
        connections: {},
        fetching: true,
        repository,
        selectedConnection: null,
        systemConnection: null,
        showConnectionModal: false,
        connectionModalMode: "manage",
    };
};

export const ConnectionStateContext = createContext<ConnectionState>(
    initState(new IndexedDbRepository()),
);

export const ConnectionActionContext = createContext<
    ActionDispatch<[action: ConnectionAction]>
>(() => null);
