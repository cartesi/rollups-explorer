import { MantineProvider } from "@mantine/core";
import { FC, FunctionComponent } from "react";
import { theme } from "../../src/providers/theme";

export const withMantineTheme = <T,>(
    Component: FunctionComponent<T>,
): FC<T> => {
    const NewComp: FC<T> = (props: T) => (
        <MantineProvider defaultColorScheme="dark" theme={theme}>
            {/* @ts-ignore */}
            <Component {...props} />
        </MantineProvider>
    );

    NewComp.displayName = Component.displayName;

    return NewComp;
};

export default withMantineTheme;
