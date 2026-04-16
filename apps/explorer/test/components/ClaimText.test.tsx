import { describe, expect, it } from "vitest";
import { ClaimText } from "../../src/components/ClaimText";
import type { Claim } from "../../src/components/types";
import { render, screen } from "../test-utils";

describe("ClaimText", () => {
    const claim: Claim = {
        hash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        parentClaims: [
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        ],
    };

    it("should render claim hash", () => {
        render(<ClaimText claim={claim} shorten={false} />);

        expect(screen.getByText(claim.hash)).toBeInTheDocument();
    });

    it("should render parent avatar when showParents is true", () => {
        const { container } = render(<ClaimText claim={claim} showParents />);
        const expected = claim.parentClaims?.[0] ?? "0x";

        expect(
            container.querySelector(`#hash-avatar-${expected}`),
        ).toBeVisible();
    });

    it("should be able to hide the avatars", () => {
        render(<ClaimText claim={claim} withIcon={false} />);

        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
});
