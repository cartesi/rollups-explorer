"use client";
import { isNil, omit, pathOr } from "ramda";
import type { ConnectionReducer, ConnectionState } from "./ConnectionContexts";
import type { DbNodeConnectionConfig } from "./types";

const mapById = (
    accumulator: ConnectionState["connections"],
    next: DbNodeConnectionConfig,
) => {
    if (next.id) {
        accumulator[next.id] = next;
    }
    return accumulator;
};

const connectionsById = (
    conns: DbNodeConnectionConfig[],
    systemConnection: DbNodeConnectionConfig | null,
) => {
    const newList = isNil(systemConnection)
        ? conns
        : [...conns, systemConnection];
    return newList.reduce(mapById, {});
};

const reducer: ConnectionReducer = (state, action) => {
    switch (action.type) {
        case "open_modal":
            return {
                ...state,
                showConnectionModal: true,
                connectionModalMode: pathOr("manage", ["payload"], action),
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
                connections: connectionsById(
                    action.payload.connections,
                    state.systemConnection,
                ),
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
                systemConnection: action.payload.connection,
                connections: {
                    ...state.connections,
                    [action.payload.connection.id]: action.payload.connection,
                },
            };
        default:
            return state;
    }
};

export default reducer;
