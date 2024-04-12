import { ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { Analytics } from "@vercel/analytics/react";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import type { FC, ReactNode } from "react";
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

const Shell = dynamic(() => import("../components/layout/shell"), {
    ssr: false,
});
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
                    <>
                        <Notifications />
                        <Shell>{children}</Shell>
                    </>
                </Providers>
                <Analytics />
            </body>
        </html>
    );
};

export default Layout;
