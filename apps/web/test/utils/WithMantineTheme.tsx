import { MantineProvider } from "@mantine/core";
import { FC } from "react";
import { theme } from "../../src/providers/theme";

export const withMantineTheme = <T,>(Component: FC<T>): FC<T> => {
    const NewComp: FC<T> = (props: T) => (
        <MantineProvider theme={theme}>{Component(props)}</MantineProvider>
    );

    NewComp.displayName = Component.displayName;

    return NewComp;
};

export default withMantineTheme;
