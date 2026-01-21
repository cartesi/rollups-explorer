import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Preview, StoryContext, StoryFn } from "@storybook/nextjs";
import Layout from "../src/components/layout/Layout";
import DataProvider from '../src/providers/DataProvider';
import WalletProvider from '../src/providers/WalletProvider';
import theme from "../src/providers/theme";
import './global.css';

// @ts-expect-error JSON.stringify will try to call toJSON on bigints.  ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const withLayout = (StoryFn: StoryFn, context: StoryContext) => {
    const { title } = context;
    const [sectionType] = title.split("/");

    if (sectionType.toLowerCase().includes("pages"))
        return <Layout>{StoryFn(context.args, context)}</Layout>;

    return <>{StoryFn(context.args, context)}</>;
};

const withWallet = (StoryFn: StoryFn, context: StoryContext) => {
    return <DataProvider><WalletProvider>{StoryFn(context.args, context)}</WalletProvider></DataProvider>
}
const withMantine = (StoryFn: StoryFn, context: StoryContext) => {
    const currentBg = context.globals.backgrounds?.value ?? "light";

    return (
        <MantineProvider forceColorScheme={currentBg} theme={theme}>
            {StoryFn(context.args, context)}
        </MantineProvider>
    );
};

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
    decorators: [
        // Order matters. So layout decorator first. Fn calling is router(mantine(layout))
        withLayout,
        withWallet,
        withMantine,
    ],
};

export default preview;
