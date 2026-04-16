import { describe, expect, it } from "vitest";
import { LongText } from "../../src/components/LongText";
import { render, screen } from "../test-utils";

describe("LongText component", () => {
    it("should shorten hash-like text by default", () => {
        render(
            <LongText value="0x1234567890abcdef1234567890abcdef1234567890abcdef" />,
        );

        expect(screen.getByText("0x1234...cdef")).toBeInTheDocument();
    });

    it("should render full text when shorten is false", () => {
        const value = "0x123456";
        render(<LongText value={value} shorten={false} copyButton={false} />);

        expect(screen.getByText(value)).toBeInTheDocument();
    });
});
