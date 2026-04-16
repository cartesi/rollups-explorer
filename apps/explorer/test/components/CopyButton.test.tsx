import { describe, expect, it } from "vitest";
import CopyButton from "../../src/components/CopyButton";
import { render, screen } from "../test-utils";

describe("CopyButton", () => {
    it("should render copy icon", () => {
        render(<CopyButton value="0xabc" />);

        expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
    });
});
