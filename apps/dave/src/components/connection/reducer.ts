"use client";
import { omit } from "ramda";
import type { ConnectionReducer, ConnectionState } from "./ConnectionContexts";
import type { DbNodeConnectionConfig } from "./types";

const mapById = (
    acc: ConnectionState["connections"],
    next: DbNodeConnectionConfig,
) => {
    if (next.id) {
        acc[next.id] = next;
    }
    return acc;
};

const reducer: ConnectionReducer = (state, action) => {
    switch (action.type) {
        case "open_modal":
            return {
                ...state,
                showConnectionModal: true,
            };
        case "close_modal":
            return {
                ...state,
                showConnectionModal: false,
            };

        case "add_connection":
            return {
                ...state,
                connections: {
                    ...state.connections,
                    [action.payload.connection.id]: action.payload.connection,
                },
            };
        case "remove_connection":
            return {
                ...state,
                connections: omit([action.payload.id], state.connections),
            };
        case "set_connections":
            return {
                ...state,
                connections: action.payload.connections.reduce(mapById, {}),
            };
        case "set_fetching":
            return {
                ...state,
                fetching: action.payload,
            };
        case "set_selected_connection": {
            return {
                ...state,
                selectedConnection: action.payload.id,
            };
        }
        case "set_system_connection":
            return {
                ...state,
                systemConnection: action.payload.id,
            };
        default:
            return state;
    }
};

export default reducer;
