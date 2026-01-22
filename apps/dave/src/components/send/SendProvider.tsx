"use client";
import { useReducer, type FC, type PropsWithChildren } from "react";
import {
    SendActionContext,
    SendStateContext,
    type SendReducer,
} from "./SendContexts";

const sendReducer: SendReducer = (state, action) => {
    switch (action.type) {
        case "deposit_eth":
        case "deposit_erc20":
        case "deposit_erc721":
        case "deposit_erc1155Single":
        case "deposit_erc1155Batch":
        case "generic_input":
            return {
                transactionType: action.type,
                application: action.payload.application,
                timestamp: Date.now(),
            };
        case "close_modal":
            return null;
        default:
            return state;
    }
};

export const SendProvider: FC<PropsWithChildren> = ({ children }) => {
    const [sendState, dispatch] = useReducer(sendReducer, null);

    return (
        <SendStateContext value={sendState}>
            <SendActionContext value={dispatch}>{children}</SendActionContext>
        </SendStateContext>
    );
};
