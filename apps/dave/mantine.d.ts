import * as core from "@mantine/core";

type ExtendedCustomColors =
    | "open"
    | "disputed"
    | "closed"
    | "finalized"
    | core.DefaultMantineColor;
declare module "@mantine/core" {
    export { core };

    /**
     * Making it optional as default values to the
     * declared interface members are added in the theme.
     */
    export interface SpoilerProps extends core.SpoilerProps {
        hideLabel?: core.SpoilerProps["hideLabel"];
        showLabel?: core.SpoilerProps["showLabel"];
    }
    export interface MantineThemeOther {
        lgIconSize: number;
        mdIconSize: number;
        zIndexXS: number;
        zIndexSM: number;
        zIndexMD: number;
        zIndexLG: number;
        zIndexXL: number;
    }

    export interface MantineThemeColorsOverride {
        colors: Record<ExtendedCustomColors, core.MantineColorsTuple>;
    }
}
