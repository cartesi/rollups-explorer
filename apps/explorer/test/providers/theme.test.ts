import { defaultVariantColorsResolver } from "@mantine/core";
import { describe, expect, it } from "vitest";
import theme, { variantColorResolver } from "../../src/providers/theme";

const contrast = "var(--mantine-primary-color-contrast)";

describe("variantColorResolver", () => {
    it("should use the brand contrast colour on filled brand variants", () => {
        expect(
            variantColorResolver({ theme, variant: "filled", color: "cartesi" })
                .color,
        ).toBe(contrast);
    });

    it("should leave other variants of the brand colour unchanged", () => {
        const input = { theme, variant: "light", color: "cartesi" };

        expect(variantColorResolver(input)).toEqual(
            defaultVariantColorsResolver(input),
        );
    });

    it("should leave filled variants of other colours unchanged", () => {
        const input = { theme, variant: "filled", color: "red" };

        expect(variantColorResolver(input)).toEqual(
            defaultVariantColorsResolver(input),
        );
    });
});
