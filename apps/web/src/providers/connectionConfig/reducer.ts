"use client";
import { descend, propEq, propOr, reject, sort } from "ramda";
import { Connection, Reducer, State } from "./types";

export const initialState = {
    connections: [],
    showConnectionModal: false,
    connectionAddress: undefined,
    fetching: false,
} satisfies State;

const sortByTimestampDesc = sort<Connection>(
    descend<Connection>(propOr<number>(0, "timestamp")),
);

export const connectionConfigReducer: Reducer = (state, action): State => {
    switch (action.type) {
        case "SHOW_CONNECTION_MODAL":
            return {
                ...state,
                showConnectionModal: true,
                connectionAddress: action.payload?.address,
            };
        case "HIDE_CONNECTION_MODAL":
            return {
                ...state,
                showConnectionModal: false,
                connectionAddress: undefined,
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
        case "SET_FETCHING":
            return {
                ...state,
                fetching: action.payload,
            };
        default:
            return state;
    }
};
