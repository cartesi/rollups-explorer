"use client";
import { descend, prop, propEq, reject, sort } from "ramda";
import { Connection, Reducer, State } from "./types";

export const initialState = {
    connections: [],
    showConnectionModal: false,
} satisfies State;

const sortByTimestampDesc = sort<Connection>(
    descend(prop<number>("timestamp")),
);

export const connectionConfigReducer: Reducer = (state, action): State => {
    switch (action.type) {
        case "SHOW_CONNECTION_MODAL":
            return {
                ...state,
                showConnectionModal: true,
            };
        case "HIDE_CONNECTION_MODAL":
            return {
                ...state,
                showConnectionModal: false,
            };
        case "SET_CONNECTIONS":
            return {
                ...state,
                connections: sortByTimestampDesc(action.payload),
            };
        case "ADD_CONNECTION":
            return {
                ...state,
                connections: sortByTimestampDesc([
                    ...state.connections,
                    action.payload.connection,
                ]),
            };

        case "REMOVE_CONNECTION":
            return {
                ...state,
                connections: sortByTimestampDesc(
                    reject(
                        propEq(action.payload.address, "address"),
                        state.connections,
                    ),
                ),
            };
        default:
            return state;
    }
};
