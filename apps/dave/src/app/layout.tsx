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
