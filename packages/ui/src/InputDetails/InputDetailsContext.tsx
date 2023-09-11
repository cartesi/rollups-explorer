"use client";

import { join, keys, map, memoizeWith, pick, pipe, prop } from "ramda";
import React, {
    Dispatch,
    FC,
    ReactNode,
    createContext,
    useContext,
    useReducer,
} from "react";
import { IconType } from "react-icons";
import { TbInbox, TbInfoTriangle, TbReport, TbTicket } from "react-icons/tb";
import { OptionalContents, SupportedContent } from "./interfaces";

export interface InputDetailsProviderProps {
    children: ReactNode;
}

type State = {
    supportedTabs: typeof SUPPORTED_TABS;
    availableContent: OptionalContents;
};
type Action = { type: "SET_DEFINED_CONTENT"; payload: OptionalContents };
type Reducer = (state: State, action: Action) => State;

type TAB = { label: string; icon: IconType; type: SupportedContent };

const SUPPORTED_TABS = [
    {
        label: "Input",
        icon: TbInbox,
        type: "InputContent",
    },
    {
        label: "Notices",
        icon: TbInfoTriangle,
        type: "NoticeContent",
    },
    {
        label: "Reports",
        icon: TbReport,
        type: "ReportContent",
    },
    {
        label: "Vouchers",
        icon: TbTicket,
        type: "VoucherContent",
    },
] as const satisfies readonly TAB[];

const initialState: State = {
    supportedTabs: SUPPORTED_TABS,
    availableContent: {},
};

type ContextProps = { state: State; dispatch: Dispatch<Action> };

const InputDetailsContext = createContext<ContextProps>({
    state: initialState,
    dispatch: () => {},
});

const getOnlySupportedContent = (dict: OptionalContents) => {
    const supportedTypes = map(prop("type"), SUPPORTED_TABS);
    return pick(supportedTypes, dict);
};

const reducer: Reducer = (state, action) => {
    switch (action.type) {
        case "SET_DEFINED_CONTENT":
            return {
                ...state,
                availableContent: getOnlySupportedContent(action.payload),
            };
        default:
            return state;
    }
};

type Predicate<R> = (p: State) => R;
type UseSelector = <R>(p: Predicate<R>) => [R];

const useSelector: UseSelector = (predicate) => {
    const state = useInputDetailsState();
    const result = predicate(state);

    return [result];
};

const availableContentAsSet = pipe(
    prop("availableContent"),
    keys,
    memoizeWith(join("/"), (keys) => new Set(keys)),
);

export const useDefinedContentSet = () => {
    const [definedContentSet] = useSelector(availableContentAsSet);
    return definedContentSet;
};

export const useSupportedTabs = () => {
    const [result] = useSelector(prop("supportedTabs"));
    return result;
};

export const useAvailableContent = () => {
    const [result] = useSelector(prop("availableContent"));
    return result;
};

export const useInputDetailsState = () => {
    const ctx = useContext(InputDetailsContext);
    return ctx.state;
};

export const useInputDetailsDispatch = () => {
    const ctx = useContext(InputDetailsContext);
    return ctx.dispatch;
};

export const InputDetailsProvider: FC<InputDetailsProviderProps> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const store = React.useMemo(() => ({ state, dispatch }), [state]);

    return (
        <InputDetailsContext.Provider value={store}>
            {children}
        </InputDetailsContext.Provider>
    );
};
