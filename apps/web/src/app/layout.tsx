import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import type { FC, ReactNode } from "react";
import { Metadata } from "next";
import { ColorSchemeScript } from "@mantine/core";
import { Providers } from "../providers/providers";
import Shell from "../components/shell";

export const metadata: Metadata = {
    title: {
        template: "%s | CartesiScan",
        default: "Blockchain Explorer | CartesiScan",
    },
    description:
        "CartesiScan is a tool for inspecting and analyzing Cartesi rollups applications. Blockchain explorer for Ethereum Networks.",
    icons: {
        icon: "/favicon.ico",
    },
};

interface LayoutProps {
    children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
    return (
        <html lang="en">
            <head>
                <ColorSchemeScript />
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
