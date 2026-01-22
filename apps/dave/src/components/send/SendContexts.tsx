"use client";
import type { Application } from "@cartesi/viem";
import { createContext, type ActionDispatch } from "react";

// Actions
type CloseModal = { type: "close_modal" };
export type InputType = "generic_input";
export type DepositType =
    | "deposit_eth"
    | "deposit_erc20"
    | "deposit_erc721"
    | "deposit_erc1155Single"
    | "deposit_erc1155Batch";

export type TransactionType = DepositType | InputType;

type Deposit = { type: DepositType; payload: { application: Application } };
type GenericInput = { type: InputType; payload: { application: Application } };

type SendState = {
    application: Application;
    transactionType: TransactionType;
    timestamp: number;
} | null;

export type SendAction = CloseModal | Deposit | GenericInput;
export type SendReducer = (state: SendState, action: SendAction) => SendState;

export const SendStateContext = createContext<SendState>(null);
export const SendActionContext = createContext<
    ActionDispatch<[action: SendAction]>
>(() => null);
