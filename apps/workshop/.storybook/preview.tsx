import { MantineProvider, useMantineColorScheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { useEffect } from "react";
import { Globals } from "storybook/internal/csf";
import { addons } from "storybook/preview-api";
import { theme } from "../../web/src/providers/theme";
import WalletProvider from "./walletProvider";

const channel = addons.getChannel();

function ColorSchemeWrapper({ children }: { children: React.ReactNode }) {
    const { setColorScheme } = useMantineColorScheme();
    const handleColorScheme = ({ globals }: { globals: Globals }) => {
        const isDarkMode = globals.backgrounds.value === "dark";
        setColorScheme(isDarkMode ? "dark" : "light");
    };

    useEffect(() => {
        channel.on("updateGlobals", handleColorScheme);
        return () => channel.off("updateGlobals", handleColorScheme);
    }, [channel]);

    return <>{children}</>;
}

export const decorators = [
    (renderStory: any) => <WalletProvider>{renderStory()}</WalletProvider>,
    (renderStory: any) => (
        <ColorSchemeWrapper>{renderStory()}</ColorSchemeWrapper>
    ),
    (renderStory: any) => (
        <MantineProvider theme={theme}>{renderStory()}</MantineProvider>
    ),
];
