import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { FC, ReactNode } from "react";
import { theme } from "./theme";

export type StyleProviderProps = {
    children?: ReactNode;
};

const StyleProvider: FC<StyleProviderProps> = (props) => {
    return (
        <MantineProvider defaultColorScheme="dark" theme={theme}>
            <Notifications />
            {props.children}
        </MantineProvider>
    );
};

export default StyleProvider;
