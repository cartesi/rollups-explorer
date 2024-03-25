import {
    AppShell,
    Card,
    DEFAULT_THEME,
    List,
    MantineThemeOverride,
    Modal,
    createTheme,
    mergeMantineTheme,
} from "@mantine/core";

const themeOverride: MantineThemeOverride = createTheme({
    cursorType: "pointer",
    fontFamily: "Open Sans, sans-serif",
    primaryColor: "cyan",
    other: {
        iconSize: 21,
    },
    components: {
        Modal: Modal.extend({
            defaultProps: {
                size: "lg",
                centered: true,
                overlayProps: {
                    backgroundOpacity: 0.55,
                    blur: 3,
                },
            },
        }),
        AppShell: AppShell.extend({
            defaultProps: {
                header: { height: 60 },
                navbar: {
                    width: 300,
                    breakpoint: "sm",
                },
                aside: {
                    width: 400,
                    breakpoint: "sm",
                },
            },
        }),
        List: List.extend({
            defaultProps: {
                center: true,
                spacing: "0.5rem",
            },
        }),
        Card: Card.extend({
            defaultProps: {
                shadow: "sm",
                withBorder: true,
            },
        }),
    },
});

export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);
