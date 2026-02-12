"use client";
import { descend, propOr, reject, sort } from "ramda";
import type { ConnectionReducer } from "./ConnectionContexts";
import type { NodeConnectionConfig } from "./types";

const sortByTimestampDesc = sort<NodeConnectionConfig>(
    descend<NodeConnectionConfig>(propOr<number>(0, "timestamp")),
);

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
                connections: sortByTimestampDesc([
                    ...state.connections,
                    action.payload.connection,
                ]),
            };
        case "remove_connection":
            return {
                ...state,
                connections: sortByTimestampDesc(
                    reject(
                        (val) => val.id === action.payload.id,
                        state.connections,
                    ),
                ),
            };
        case "set_connections":
            return {
                ...state,
                connections: sortByTimestampDesc(action.payload.connections),
            };
        case "set_fetching":
            return {
                ...state,
                fetching: action.payload,
            };
        case "set_selected_connection": {
            return {
                ...state,
                selectedConnection: action.payload.connection,
            };
        }
        case "set_system_connection":
            return {
                ...state,
                systemConnection: action.payload.connection,
            };
        default:
            return state;
    }
};

export default reducer;
