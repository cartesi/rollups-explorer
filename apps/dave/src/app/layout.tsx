"use client";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { Analytics } from "@vercel/analytics/react";
import type { FC, ReactNode } from "react";
import { StrictMode } from "react";
import Layout from "../components/layout/Layout";
import DataProvider from "../providers/DataProvider";
import { StyleProvider } from "../providers/StyleProvider";

interface RootLayoutProps {
    children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
    return (
        <html lang="en" {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <StrictMode>
                    <StyleProvider>
                        <DataProvider>
                            <Layout>{children}</Layout>
                            <Analytics />
                        </DataProvider>
                    </StyleProvider>
                </StrictMode>
            </body>
        </html>
    );
};

export default RootLayout;
