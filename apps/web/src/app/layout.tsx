import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import React, { FC } from "react";

import { ColorSchemeScript } from "@mantine/core";
import { Providers } from "../providers/providers";
import Shell from "./shell";

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <html lang="en">
            <head>
                <ColorSchemeScript />
                <link rel="shortcut icon" href="/favicon.ico" />
            </head>
            <body>
                <Providers>
                    <Shell>{children}</Shell>
                </Providers>
            </body>
        </html>
    );
};

export default Layout;
