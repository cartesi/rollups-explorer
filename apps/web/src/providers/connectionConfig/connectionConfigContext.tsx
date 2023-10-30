"use client";
import { createContext } from "react";
import localRepository from "./localRepository";
import { initialState } from "./reducer";
import { ContextProps } from "./types";

export const ConnectionConfigContext = createContext<ContextProps>({
    state: initialState,
    dispatch: () => {},
    repository: localRepository,
});
