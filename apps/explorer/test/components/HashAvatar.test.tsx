import { describe, expect, it } from "vitest";
import { HashAvatar } from "../../src/components/HashAvatar";
import { render, screen } from "../test-utils";

describe("HashAvatar", () => {
    it("renders an avatar img with data URL src", () => {
        render(
            <HashAvatar hash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" />,
        );

        const img = screen.getByRole("img");
        expect(img.getAttribute("src")).toContain("data:image/svg+xml;base64,");
    });
});
