import { MantineProvider, createTheme } from "@mantine/core";
import { FC } from "react";

const theme = createTheme({
    fontFamily: "Open Sans, sans-serif",
    primaryColor: "cyan",
});

export const withMantineTheme = <T,>(Component: FC<T>): FC<T> => {
    const NewComp: FC<T> = (props: T) => (
        <MantineProvider theme={theme}>{Component(props)}</MantineProvider>
    );

    NewComp.displayName = Component.displayName;

    return NewComp;
};

export default withMantineTheme;
