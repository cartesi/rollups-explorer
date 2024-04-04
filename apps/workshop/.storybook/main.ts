import { dirname, join } from "path";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    framework: getAbsolutePath("@storybook/react-vite"),
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [
        getAbsolutePath("@storybook/addon-links"),
        getAbsolutePath("@storybook/addon-essentials"),
        getAbsolutePath("@storybook/addon-onboarding"),
        getAbsolutePath("@storybook/addon-interactions"),
        getAbsolutePath("@storybook/addon-themes"),
        getAbsolutePath("storybook-dark-mode"),
        getAbsolutePath("@storybook/addon-viewport"),
        getAbsolutePath("@storybook/addon-mdx-gfm"),
    ],
    docs: {
        autodocs: "tag",
    },
};
export default config;

function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, "package.json")));
}
