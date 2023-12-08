import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import React, { FC } from "react";
import { Metadata } from "next";
import { ColorSchemeScript } from "@mantine/core";
import { Providers } from "../providers/providers";
import Shell from "../components/shell";

interface LayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: {
        template: "%s | CartesiScan",
        default: "Blockchain Explorer | CartesiScan",
    },
    description:
        "CartesiScan is a tool for inspecting and analyzing Cartesi rollups applications. Blockchain explorer for Ethereum Networks.",
};

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
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
