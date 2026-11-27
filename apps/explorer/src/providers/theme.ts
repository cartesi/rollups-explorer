import { cartesiColors, cartesiFonts } from "@cartesi/brand";
import {
    Anchor,
    AppShell,
    Autocomplete,
    Badge,
    Checkbox,
    Combobox,
    createTheme,
    DEFAULT_THEME,
    defaultVariantColorsResolver,
    Indicator,
    mergeMantineTheme,
    Pagination,
    parseThemeColor,
    Select,
    Spoiler,
    Switch,
    Title,
    Tooltip,
    virtualColor,
    type CSSVariablesResolver,
    type MantineColor,
    type MantineColorsTuple,
    type MantineTheme,
    type VariantColorsResolver,
} from "@mantine/core";
import classes from "./theme.module.css";

const cartesiTeal: MantineColorsTuple = [
    "#e0f6f9",
    "#b3e8f0",
    "#80d9e6",
    "#4dc9db",
    "#26bcd2",
    "#0aa9c1",
    cartesiColors.teal,
    "#007a90",
    "#00677a",
    "#005464",
];

const cartesiCyan: MantineColorsTuple = [
    "#e0feff",
    "#c2fdff",
    "#a3fcff",
    "#85fbff",
    "#66faff",
    "#47f9ff",
    "#29f8ff",
    "#0af7ff",
    cartesiColors.cyan,
    "#00d3e1",
];

const brandContrast = "var(--mantine-primary-color-contrast)";

const isBrandColor = (theme: MantineTheme, color?: MantineColor) =>
    parseThemeColor({ color: color ?? theme.primaryColor, theme }).color ===
    "cartesi";

export const variantColorResolver: VariantColorsResolver = (input) => {
    const colors = defaultVariantColorsResolver(input);

    return input.variant === "filled" && isBrandColor(input.theme, input.color)
        ? { ...colors, color: brandContrast }
        : colors;
};

const customTheme = createTheme({
    fontFamily: cartesiFonts.body.stack,
    headings: {
        fontFamily: cartesiFonts.headline.stack,
        fontWeight: String(cartesiFonts.headline.weight),
    },
    colors: {
        cartesiTeal,
        cartesiCyan,
        cartesi: virtualColor({
            name: "cartesi",
            light: "cartesiTeal",
            dark: "cartesiCyan",
        }),
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
        info: virtualColor({ name: "info", light: "blue", dark: "blue" }),
        warning: virtualColor({
            name: "warning",
            light: "yellow",
            dark: "yellow",
        }),
        foreclosed: virtualColor({
            name: "foreclosed",
            light: "grape",
            dark: "grape",
        }),
    },
    primaryColor: "cartesi",
    primaryShade: {
        dark: 8,
        light: 6,
    },
    variantColorResolver,
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
        Anchor: Anchor.extend({
            defaultProps: {
                underline: "always",
            },
        }),
        Title: Title.extend({
            classNames: {
                root: classes.title,
            },
        }),
        Badge: Badge.extend({
            defaultProps: {
                variant: "filled",
            },
        }),
        Pagination: Pagination.extend({
            vars: (theme, { color }) => ({
                root: isBrandColor(theme, color)
                    ? { "--pagination-active-color": brandContrast }
                    : {},
            }),
        }),
        Checkbox: Checkbox.extend({
            vars: (theme, { color, iconColor, variant }) => ({
                root:
                    isBrandColor(theme, color) &&
                    !iconColor &&
                    variant !== "outline"
                        ? { "--checkbox-icon-color": brandContrast }
                        : {},
            }),
        }),
        Indicator: Indicator.extend({
            vars: (theme, { color }) => ({
                root: isBrandColor(theme, color)
                    ? { "--indicator-text-color": brandContrast }
                    : {},
            }),
        }),
        Switch: Switch.extend({
            classNames: (theme, { color }) =>
                isBrandColor(theme, color)
                    ? {
                          thumb: classes.switchThumb,
                          trackLabel: classes.switchTrackLabel,
                      }
                    : {},
        }),
        Combobox: Combobox.extend({
            classNames: { option: classes.comboboxOption },
        }),
        Select: Select.extend({
            classNames: { option: classes.comboboxOption },
        }),
        Autocomplete: Autocomplete.extend({
            classNames: { option: classes.comboboxOption },
        }),
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
        AppShell: AppShell.extend({
            defaultProps: {
                header: { height: 60 },
                aside: {
                    width: 0,
                    breakpoint: "sm",
                },
                navbar: {
                    width: 300,
                    breakpoint: "sm",
                },
            },
        }),
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
        Tooltip: Tooltip.extend({
            defaultProps: {
                transitionProps: { transition: "pop" },
                withArrow: true,
                maw: "95%",
                zIndex: 100,
                multiline: true,
                style: { textAlign: "start" },
            },
        }),
    },
}) as MantineTheme;

const theme = mergeMantineTheme(DEFAULT_THEME, customTheme);

export const cssVariablesResolver: CSSVariablesResolver = () => ({
    variables: {},
    light: { "--mantine-color-warning-text": "var(--mantine-color-yellow-8)" },
    dark: {
        "--mantine-primary-color-contrast": cartesiColors.black,
        "--mantine-color-anchor": cartesiColors.cyan,
        "--mantine-color-cartesi-text": cartesiColors.cyan,
        "--mantine-color-cartesi-outline": cartesiColors.cyan,
        "--mantine-color-cartesi-light-color": cartesiColors.cyan,
    },
});

export default theme;
