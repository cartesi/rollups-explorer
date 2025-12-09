import type { StorybookConfig } from "@storybook/nextjs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [getAbsolutePath("@chromatic-com/storybook"), getAbsolutePath("@storybook/addon-docs")],
    framework: {
        name: getAbsolutePath("@storybook/nextjs"),
        options: {},
    },
};
export default config;

function getAbsolutePath(value: string): any {
    return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
