"use client";
import type { Application } from "@cartesi/viem";
import { createContext, type ActionDispatch } from "react";
import type { DbSpecification } from "../specification/types";

export type ForecloseType = "foreclose";
export type InputType = "generic_input";
export type DepositType =
    | "deposit_eth"
    | "deposit_erc20"
    | "deposit_erc721"
    | "deposit_erc1155Single"
    | "deposit_erc1155Batch";

export type TransactionType = DepositType | InputType | ForecloseType;

type CloseModal = { type: "close_modal" };
type Deposit = { type: DepositType; payload: { application: Application } };
type GenericInput = {
    type: InputType;
    payload: { application: Application; specifications: DbSpecification[] };
};
type Foreclose = { type: ForecloseType; payload: { application: Application } };

type SendState = {
    application: Application;
    specifications: DbSpecification[];
    transactionType: TransactionType;
    timestamp: number;
} | null;

export type SendAction = CloseModal | Deposit | GenericInput | Foreclose;
export type SendReducer = (state: SendState, action: SendAction) => SendState;

export const SendStateContext = createContext<SendState>(null);
export const SendActionContext = createContext<
    ActionDispatch<[action: SendAction]>
>(() => null);
