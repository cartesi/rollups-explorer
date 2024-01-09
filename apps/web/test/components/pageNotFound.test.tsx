import { afterEach, describe, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { withMantineTheme } from "../utils/WithMantineTheme";
import PageNotFound from "../../src/components/pageNotFound";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

vi.mock("next/navigation");

const useRouterMock = vi.mocked(useRouter, true);

const Component = withMantineTheme(PageNotFound);

describe("PageNotFound component", () => {
    beforeEach(() => {
        useRouterMock.mockReturnValue({
            back: () => undefined,
        } as unknown as AppRouterInstance);
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display correct title", () => {
        render(<Component />);
        expect(screen.getByText("404 Not Found")).toBeInTheDocument();
    });

    it("should display correct subtitle", () => {
        render(<Component />);
        expect(
            screen.getByText("Could not find the requested resource."),
        ).toBeInTheDocument();
    });

    it("should display correct button text", () => {
        render(<Component />);
        expect(screen.getByText("Go back")).toBeInTheDocument();
    });

    it("should invoke router.back function when button is clicked", () => {
        const mockedBackFn = vi.fn();
        useRouterMock.mockReturnValue({
            back: mockedBackFn,
        } as unknown as AppRouterInstance);

        render(<Component />);

        const link = screen.getByText("Go back") as HTMLAnchorElement;

        expect(link.getAttribute("href")).toBe("/");
    });
});
