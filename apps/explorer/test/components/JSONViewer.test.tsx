import { describe, expect, it, vi } from "vitest";
import JSONViewer from "../../src/components/JSONViewer";
import { render, screen } from "../test-utils";

vi.mock("../../src/components/specification/utils", () => ({
    stringifyContent: vi.fn((value: unknown) => JSON.stringify(value, null, 2)),
}));

describe("JSONViewer", () => {
    it("should render plain string content", () => {
        render(<JSONViewer content="hello" id="json-viewer" />);

        expect(screen.getByDisplayValue("hello")).toBeInTheDocument();
    });

    it("should render object content as stringified JSON", () => {
        render(<JSONViewer content={{ a: 1 }} id="json-viewer-object" />);

        expect(screen.getByDisplayValue(/"a": 1/)).toBeInTheDocument();
    });
});
