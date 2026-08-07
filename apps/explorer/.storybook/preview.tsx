import { useMantineColorScheme } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Preview, StoryContext, StoryFn } from "@storybook/nextjs";
import { Provider as JotaiProvider } from "jotai";
import { mswLoader } from "msw-storybook-addon/csf3";
import { pathOr } from "ramda";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { UPDATE_GLOBALS } from "storybook/internal/core-events";
import { addons, useGlobals } from 'storybook/preview-api';
import { ConnectionProvider } from "../src/components/connection/ConnectionProvider";
import { DbNodeConnectionConfig } from "../src/components/connection/types";
import Layout from "../src/components/layout/Layout";
import { SendProvider } from "../src/components/send/SendProvider";
import { supportedChains } from "../src/lib/supportedChains";
import { AppConfigProvider } from "../src/providers/AppConfigProvider";
import DataProvider from "../src/providers/DataProvider";
import { StyleProvider } from "../src/providers/StyleProvider";
import './global.css';

try {
    // @ts-expect-error JSON.stringify will try to call toJSON on bigints.  ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
    BigInt.prototype.toJSON = function () {
      return this.toString();
    };
    
} catch (error: unknown) {
    console.info((error as Error).message)
}

type Globals = ReturnType<typeof useGlobals>[0]

const withLayout = (StoryFn: StoryFn, context: StoryContext) => {
    const { title } = context;
    const [sectionType] = title.split("/");

    if (sectionType.toLowerCase().includes("pages"))
        return <Layout>{StoryFn(context.args, context)}</Layout>;

    return <>{StoryFn(context.args, context)}</>;
};


const nodeConfig: DbNodeConnectionConfig = {
    id: Number.MAX_SAFE_INTEGER,
    chain: {
        id: 31337,
        rpcUrl: pathOr(
            "http://localhost:8545",
            ["31337", "rpcUrls", "default", "http", "0"],
            supportedChains,
        ),
    },
    isDeletable: false,
    isPreferred: true,
    timestamp: Date.now(),
    version: "2.0.0-alpha.12",
    name: "storybook-mocked-setup",
    type: "system_mock",
    url: "local://in-memory",
}

const withProviders = (StoryFn: StoryFn, context: StoryContext) => {    
    return (
        <StyleProvider>            
                <AppConfigProvider value={{cartesiNodeRpcUrl: '', nodeRpcUrl: '', isMockEnabled: true, isDebugEnabled: false}}>
                    <JotaiProvider>
                        <ConnectionProvider
                            systemConnection={nodeConfig}
                        >
                            <DataProvider>
                                <SendProvider>
                                    <ColorSchemeWrapper context={context}>
                                    {StoryFn(context.args, context)}
                                    </ColorSchemeWrapper>
                                </SendProvider>
                            </DataProvider>
                        </ConnectionProvider>
                    </JotaiProvider>
                </AppConfigProvider>
        </StyleProvider>
    )
}

const withLinkClickInterception = (StoryFn: StoryFn, context: StoryContext) => (
    // Mantine's Anchor with component={Link} still renders a plain <a> tag,
    // which the browser follows natively even when the Next.js router is mocked.
    // Capturing and preventing the default on all anchor clicks keeps Storybook
    // from navigating to non-existing pages.
    <div onClick={(e) => {
        const anchor = (e.target as Element).closest('a');
        if (anchor) e.preventDefault();
    }}>
        {StoryFn(context.args, context)}
    </div>
);

const channel = addons.getChannel();

const generateNewBackgroundEvt = (colorScheme: unknown) => ({globals: { backgrounds: {value: colorScheme, grid: false}}})

// eslint-disable-next-line react-refresh/only-export-components
function ColorSchemeWrapper({ children, context}: { children: ReactNode, context: StoryContext }) {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const [latestGlobalsBg, setLatestGlobalBg] = useState<string | undefined>(colorScheme);

    const handleColorScheme = useCallback(({ globals }: { globals: Globals }) => {        
        const bgValue = globals.backgrounds?.value
        const newMode = bgValue ?? 'light';        
        if(newMode !== colorScheme) {
            setColorScheme(newMode);
            setLatestGlobalBg(newMode);  
        } else if (newMode !== latestGlobalsBg) {
            setLatestGlobalBg(newMode)
        }
        // update the handler function every time both variables change
        // as the handler is outside of React's detection. We want 
        // to make sure the handler works with fresh values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [colorScheme, latestGlobalsBg]);


    useEffect(() => {
        // Only when on story mode i.e. not on autodocs view. 
        // Due to the many re-renders until its finished. That cause slow but infinite loops.
        if(context.viewMode === 'story') {
            // on-mount emit single event to sync whatever is the default color-scheme on mantine
            channel.emit(UPDATE_GLOBALS, generateNewBackgroundEvt(colorScheme))
        }
    }, [])

    useEffect(() => {
        channel.on(UPDATE_GLOBALS, handleColorScheme);
        return () => {
             // unsubscribe to subscribe again with fresher handler.
             channel.off(UPDATE_GLOBALS, handleColorScheme);
        }
    }, [handleColorScheme]);

    useEffect(() => {
        if(colorScheme !== latestGlobalsBg) {
            channel.emit(UPDATE_GLOBALS, generateNewBackgroundEvt(colorScheme));
        }
    }, [colorScheme, latestGlobalsBg])

    

    return <>{children}</>;
}

const preview: Preview = {    
    initialGlobals: {
        backgrounds: { value: "light" },
    },
    parameters: {
        nextjs: {
            appDirectory: true,
        },
        backgrounds: {
            options: {
                light: { name: "light", value: "#ffffffff" },
                dark: { name: "dark", value: "#242424" },
            },
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
    loaders: [mswLoader()],
    decorators: [
        // Order matters. So layout decorator first. Fn calling is providers(layout(Story))
        withLayout,        
        withProviders,
        withLinkClickInterception,
    ],
};

export default preview;
