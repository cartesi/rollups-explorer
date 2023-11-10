import { FC, ReactNode } from "react";
import { ConnectionConfigContext } from "../../../src/providers/connectionConfig/connectionConfigContext";
import localRepository from "../../../src/providers/connectionConfig/localRepository";
import { initialState } from "../../../src/providers/connectionConfig/reducer";
import {
    Repository,
    State,
} from "../../../src/providers/connectionConfig/types";

type WrapperBuilder = (
    state: Partial<State>,
    repository?: Repository,
) => FC<{ children: ReactNode }>;

export const providerWrapperBuilder: WrapperBuilder = (state, repository) => {
    const provider: FC<{ children: ReactNode }> = ({ children }) => (
        <ConnectionConfigContext.Provider
            value={{
                dispatch: () => {},
                state: { ...initialState, ...state },
                repository: repository ?? localRepository,
            }}
        >
            {children}
        </ConnectionConfigContext.Provider>
    );

    return provider;
};
