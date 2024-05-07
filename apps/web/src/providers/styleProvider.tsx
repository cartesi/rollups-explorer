import { MantineProvider } from "@mantine/core";
import type { FC, ReactNode } from "react";
import { theme } from "./theme";

export type StyleProviderProps = {
    children?: ReactNode;
};

const StyleProvider: FC<StyleProviderProps> = (props) => {
    return (
        <MantineProvider defaultColorScheme="dark" theme={theme}>
            {props.children}
        </MantineProvider>
    );
};

export default StyleProvider;
