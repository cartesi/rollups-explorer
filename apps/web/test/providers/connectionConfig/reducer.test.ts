import { describe, it } from "vitest";
import {
    connectionConfigReducer,
    initialState,
} from "../../../src/providers/connectionConfig/reducer";
import {
    Connection,
    State,
} from "../../../src/providers/connectionConfig/types";
import { address, connections } from "./mocks";

describe("Connection Config Reducer", () => {
    it("should return state unchanged for unsupported action types", () => {
        const state = connectionConfigReducer(initialState, {
            // @ts-ignore
            type: "random-action",
        });

        expect(state).toHaveProperty("connections", []);
        expect(state).toHaveProperty("showConnectionModal", false);
        expect(state).toHaveProperty("connectionAddress", undefined);
    });

    it("should handle action to set initial list of connections", () => {
        const state = connectionConfigReducer(initialState, {
            type: "SET_CONNECTIONS",
            payload: connections,
        });

        expect(state.connections).toHaveLength(2);
    });

    describe("Add and Remove connection actions", () => {
        let currentState: State;

        beforeEach(() => {
            currentState = connectionConfigReducer(initialState, {
                type: "SET_CONNECTIONS",
                payload: connections,
            });
        });

        it("should handle action to add new connection to the list and keep the list sorted", () => {
            const connection: Connection = {
                address,
                url: "localhost:8080",
                timestamp: 10,
            };
            const state = connectionConfigReducer(currentState, {
                type: "ADD_CONNECTION",
                payload: { connection },
            });

            expect(state.connections).toHaveLength(3);
            expect(state.connections[0]).toHaveProperty("timestamp", 10);
            expect(state.connections[1]).toHaveProperty("timestamp", 2);
            expect(state.connections[2]).toHaveProperty("timestamp", 1);
        });

        it("should handle action remove a connection and keep the list sorted", () => {
            expect(currentState.connections).toHaveLength(2);

            const address = connections[0].address;
            const newState = connectionConfigReducer(currentState, {
                type: "REMOVE_CONNECTION",
                payload: { address },
            });
            expect(newState.connections).toHaveLength(1);
            expect(newState.connections[0]).toEqual({
                address: "0xC0bF2492b753C10eB3C7f584f8F5C667e1e5a3f5",
                url: "https://my-custom-api.host/",
                timestamp: 2,
            });
        });
    });

    describe("Modal related actions", () => {
        it("should update the modal when action is `SHOW_CONNECTION_MODAL`", () => {
            const state = connectionConfigReducer(initialState, {
                type: "SHOW_CONNECTION_MODAL",
            });

            expect(state).toHaveProperty("showConnectionModal", true);
        });

        it("should update the connection address when SHOW_CONNECTION_MODAL has a address in the payload", () => {
            const state = connectionConfigReducer(initialState, {
                type: "SHOW_CONNECTION_MODAL",
                payload: {
                    address,
                },
            });

            expect(state).toHaveProperty("showConnectionModal", true);
            expect(state).toHaveProperty("connectionAddress", address);
        });

        it("should handle action to hide the connection modal", () => {
            const currentState = connectionConfigReducer(initialState, {
                type: "SHOW_CONNECTION_MODAL",
                payload: { address },
            });

            expect(currentState.showConnectionModal).toEqual(true);
            expect(currentState.connectionAddress).toEqual(address);

            const newState = connectionConfigReducer(currentState, {
                type: "HIDE_CONNECTION_MODAL",
            });

            expect(newState.showConnectionModal).toEqual(false);
            expect(newState.connectionAddress).toBeUndefined();
        });
    });
});
