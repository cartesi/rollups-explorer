"use client";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { Analytics } from "@vercel/analytics/react";
import type { FC, ReactNode } from "react";
import { StrictMode } from "react";
import Layout from "../components/layout/Layout";
import { Providers } from "../providers/Providers";

interface RootLayoutProps {
    children: ReactNode;
}

/**
 * This is a workaround to solve a problem when react-dom-client.development
 * is trying to stringify bigints.
 *
 * refer to issue {@link https://github.com/facebook/react/issues/35004}
 * a PR is currently open here {@link https://github.com/facebook/react/pull/35013}
 */
if (process.env.NODE_ENV === "development") {
    Object.defineProperty(BigInt.prototype, "toJSON", {
        writable: false,
        enumerable: true,
        configurable: false,
        value() {
            return this.toString();
        },
    });
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
    return (
        <html lang="en" {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <StrictMode>
                    <Providers>
                        <Layout>{children}</Layout>
                    </Providers>
                    <Analytics />
                </StrictMode>
            </body>
        </html>
    );
};

export default RootLayout;
