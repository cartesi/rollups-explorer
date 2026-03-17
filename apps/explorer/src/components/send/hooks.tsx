"use client";
import type { Application } from "@cartesi/viem";
import { useContext } from "react";
import type { DbSpecification } from "../specification/types";
import { SendActionContext, SendStateContext } from "./SendContexts";

export const useSendState = () => {
    return useContext(SendStateContext);
};

export const useSendAction = () => {
    const dispatch = useContext(SendActionContext);

    return {
        depositEth: (application: Application) =>
            dispatch({ type: "deposit_eth", payload: { application } }),
        depositErc20: (application: Application) =>
            dispatch({ type: "deposit_erc20", payload: { application } }),
        depositErc721: (application: Application) =>
            dispatch({ type: "deposit_erc721", payload: { application } }),
        depositErc1155Single: (application: Application) =>
            dispatch({
                type: "deposit_erc1155Single",
                payload: { application },
            }),
        depositErc1155Batch: (application: Application) =>
            dispatch({
                type: "deposit_erc1155Batch",
                payload: { application },
            }),
        sendGenericInput: (
            application: Application,
            specifications: DbSpecification[],
        ) =>
            dispatch({
                type: "generic_input",
                payload: { application, specifications },
            }),
        closeModal: () => dispatch({ type: "close_modal" }),
    };
};
