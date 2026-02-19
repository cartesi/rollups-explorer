import { createTheme, Spoiler, virtualColor } from "@mantine/core";

const theme = createTheme({
    colors: {
        open: virtualColor({ name: "open", light: "green", dark: "green" }),
        disputed: virtualColor({
            name: "disputed",
            light: "orange",
            dark: "orange",
        }),
        closed: virtualColor({ name: "closed", light: "cyan", dark: "gray" }),
        finalized: virtualColor({
            name: "finalized",
            light: "dark",
            dark: "gray",
        }),
    },
    primaryColor: "cyan",
    primaryShade: {
        dark: 8,
        light: 6,
    },
    other: {
        lgIconSize: 40,
        mdIconSize: 24,
        smIconSize: 18,
        xsIconSize: 13,
        zIndexXS: 100,
        zIndexSM: 200,
        zIndexMD: 300,
        zIndexLG: 400,
        zIndexXL: 500,
    },
    components: {
        Modal: {
            defaultProps: {
                size: "lg",
                centered: true,
                overlayProps: {
                    backgroundOpacity: 0.55,
                    blur: 3,
                },
            },
        },
        AppShell: {
            defaultProps: {
                header: { height: 60 },
                aside: {
                    width: 0,
                    breakpoint: "sm",
                },
            },
        },
        Card: {
            defaultProps: {
                shadow: "sm",
                withBorder: true,
            },
        },
        Spoiler: Spoiler.extend({
            defaultProps: {
                hideLabel: "Show less",
                showLabel: "Show more",
                maxHeight: 80,
            },
        }),
    },
});

export default theme;
