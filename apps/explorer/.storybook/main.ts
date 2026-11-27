import nextEnv from "@next/env";
import type { StorybookConfig } from "@storybook/nextjs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const loadNextPublicEnv = (dev: boolean) => {
    const { combinedEnv } = nextEnv.loadEnvConfig(
        dirname(dirname(fileURLToPath(import.meta.url))),
        dev,
    );

    return Object.fromEntries(
        Object.entries(combinedEnv).filter(
            (entry): entry is [string, string] =>
                entry[0].startsWith("NEXT_PUBLIC_") && entry[1] !== undefined,
        ),
    );
};

const config: StorybookConfig = {
    env: (config, { configType }) => ({
        ...config,
        ...loadNextPublicEnv(configType !== "PRODUCTION"),
    }),
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [getAbsolutePath("@chromatic-com/storybook"), getAbsolutePath("@storybook/addon-docs")],
    framework: {
        name: getAbsolutePath("@storybook/nextjs"),
        options: {},
    },
    staticDirs: ["./public"],
};
export default config;

function getAbsolutePath(value: string) {
    return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
