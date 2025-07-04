import "@mantine/code-highlight/styles.css";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import type { FC, ReactNode } from "react";
import { Shell } from "../components/layout/shell-container";
import { InitialPageLogo } from "../components/layout/initialPageLogo";
import { Providers } from "../providers/providers";

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
        <html lang="en" {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript defaultColorScheme="auto" />
            </head>
            <body>
                <InitialPageLogo />
                <Providers>
                    <>
                        <Notifications />
                        <Shell>{children}</Shell>
                    </>
                </Providers>
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
};

export default Layout;
