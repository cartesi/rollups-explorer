import { useReducer, type FC, type PropsWithChildren } from "react";
import {
    SendActionContext,
    sendReducer,
    SendStateContext,
} from "./SendContexts";

export const SendProvider: FC<PropsWithChildren> = ({ children }) => {
    const [sendState, dispatch] = useReducer(sendReducer, null);

    return (
        <SendStateContext value={sendState}>
            <SendActionContext value={dispatch}>{children}</SendActionContext>
        </SendStateContext>
    );
};
