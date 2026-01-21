import type { Application } from "@cartesi/viem";
import { createContext, type ActionDispatch, type ReactNode } from "react";

type SendState = {
    component: ReactNode;
    application: Application;
    timestamp: number;
} | null;
// Actions
type CloseModal = { type: "close_modal" };
type InputType = "generic_input";
type DepositType =
    | "deposit_eth"
    | "deposit_erc20"
    | "deposit_erc721"
    | "deposit_erc1155Single"
    | "deposit_erc1155Batch";

type Deposit = { type: DepositType; payload: { application: Application } };
type GenericInput = { type: InputType; payload: { application: Application } };

type SendAction = CloseModal | Deposit | GenericInput;
type SendReducer = (state: SendState, action: SendAction) => SendState;

export const SendStateContext = createContext<SendState>(null);
export const SendActionContext = createContext<
    ActionDispatch<[action: SendAction]>
>(() => null);

export const sendReducer: SendReducer = (state, action) => {
    switch (action.type) {
        case "deposit_eth":
            return {
                component: (
                    <h1>Deposit Eth {action.payload.application.name}</h1>
                ),
                application: action.payload.application,
                timestamp: Date.now(),
            };
        case "deposit_erc20":
            return {
                component: (
                    <h1>Deposit ERC-20 {action.payload.application.name}</h1>
                ),
                application: action.payload.application,
                timestamp: Date.now(),
            };
        case "deposit_erc721":
            return {
                component: (
                    <h1>Deposit ERC-721 {action.payload.application.name}</h1>
                ),
                application: action.payload.application,
                timestamp: Date.now(),
            };
        case "deposit_erc1155Single":
            return {
                component: (
                    <h1>
                        Deposit ERC-1155 (single){" "}
                        {action.payload.application.name}
                    </h1>
                ),
                application: action.payload.application,
                timestamp: Date.now(),
            };
        case "deposit_erc1155Batch":
            return {
                component: (
                    <h1>
                        Deposit ERC-1155 (batch){" "}
                        {action.payload.application.name}
                    </h1>
                ),
                application: action.payload.application,
                timestamp: Date.now(),
            };
        case "generic_input":
            return {
                component: (
                    <h1>
                        Send Generic Input to {action.payload.application.name}
                    </h1>
                ),
                application: action.payload.application,
                timestamp: Date.now(),
            };
        case "close_modal":
            return null;
        default:
            return state;
    }
};
