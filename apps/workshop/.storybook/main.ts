import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    framework: "@storybook/react-vite",
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-onboarding",
        "@storybook/addon-interactions",
        "@storybook/addon-styling",
        "storybook-dark-mode",
        "@storybook/addon-viewport",
    ],
    docs: {
        autodocs: "tag",
    },
};
export default config;
