"use client";
import { createContext, type ActionDispatch } from "react";
import IndexedDbRepository from "./indexedDbRepository";
import type { NodeConnectionConfig, Repository } from "./types";

// Actions
type CloseModal = { type: "close_modal" };
type OpenModal = { type: "open_modal" };
type SetFetching = { type: "set_fetching"; payload: boolean };
type AddConnection = {
    type: "add_connection";
    payload: { connection: NodeConnectionConfig };
};
type RemoveConnection = { type: "remove_connection"; payload: { id: number } };
type SetSelectedConnection = {
    type: "set_selected_connection";
    payload: { connection: NodeConnectionConfig };
};
type SetSystemConnection = {
    type: "set_system_connection";
    payload: { connection: NodeConnectionConfig };
};
type SetConnections = {
    type: "set_connections";
    payload: { connections: NodeConnectionConfig[] };
};

export type ConnectionState = {
    systemConnection: NodeConnectionConfig | null;
    selectedConnection: NodeConnectionConfig | null;
    repository: Repository;
    connections: NodeConnectionConfig[];
    showConnectionModal: boolean;
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
        connections: [],
        fetching: true,
        repository,
        selectedConnection: null,
        systemConnection: null,
        showConnectionModal: false,
    };
};

export const ConnectionStateContext = createContext<ConnectionState>(
    initState(new IndexedDbRepository()),
);
export const ConnectionActionContext = createContext<
    ActionDispatch<[action: ConnectionAction]>
>(() => null);
