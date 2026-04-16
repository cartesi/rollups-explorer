import { describe, expect, it, vi } from "vitest";
import { TimeSlider } from "../../src/components/TimeSlider";
import { render, screen } from "../test-utils";

describe("TimeSlider", () => {
    it("should call onChange with max timestamp on mount", () => {
        const onChange = vi.fn();
        render(<TimeSlider timestamps={[100, 200, 300]} onChange={onChange} />);

        expect(onChange).toHaveBeenCalledWith(300);
    });

    it("should render slider input", () => {
        const onChange = vi.fn();
        render(<TimeSlider timestamps={[100, 200]} onChange={onChange} />);

        expect(screen.getByRole("slider")).toBeInTheDocument();
    });
});
