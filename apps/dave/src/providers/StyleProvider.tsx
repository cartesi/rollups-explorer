import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { FC, PropsWithChildren } from "react";
import theme from "./theme";

export const StyleProvider: FC<PropsWithChildren> = ({ children }) => {
    return (
        <MantineProvider theme={theme} forceColorScheme="dark">
            <Notifications />
            {children}
        </MantineProvider>
    );
};
