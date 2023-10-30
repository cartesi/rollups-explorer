import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { FC } from "react";
import { theme } from "./theme";

export type StyleProviderProps = {
    children?: React.ReactNode;
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
