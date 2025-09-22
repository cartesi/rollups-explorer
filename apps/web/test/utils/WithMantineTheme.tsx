import { MantineProvider } from "@mantine/core";
import { FC, FunctionComponent, ReactNode, JSX } from "react";
import { theme } from "../../src/providers/theme";

export const withMantineTheme = <T,>(
    Component: FunctionComponent<T>,
): FC<T> => {
    const NewComp: FC<T> = (props: T) => {
        return (
            <MantineProvider defaultColorScheme="dark" theme={theme}>
                <Component {...(props as JSX.IntrinsicAttributes & T)} />
            </MantineProvider>
        );
    };

    NewComp.displayName = Component.displayName;

    return NewComp;
};

export default withMantineTheme;
