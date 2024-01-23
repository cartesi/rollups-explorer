import { afterEach, beforeEach, describe, it } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import {
    ReadonlyURLSearchParams,
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import { useScrollIntoView } from "@mantine/hooks";
import { withMantineTheme } from "../utils/WithMantineTheme";
import Paginated from "../../src/components/paginated";
import { usePaginationParams } from "../../src/hooks/usePaginationParams";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

vi.mock("next/navigation");
const usePathnameMock = vi.mocked(usePathname, true);
const useRouterMock = vi.mocked(useRouter, true);
const useSearchParamsMock = vi.mocked(useSearchParams, true);

vi.mock("../../src/hooks/usePaginationParams");
const usePaginationParamsMock = vi.mocked(usePaginationParams, true);

vi.mock("@mantine/hooks");
const useScrollIntoViewMock = vi.mocked(useScrollIntoView, true);

const Component = withMantineTheme(Paginated);

const defaultProps = {
    totalCount: 10,
    fetching: false,
    onChange: () => undefined,
};

describe("Paginated component", () => {
    beforeEach(() => {
        usePathnameMock.mockReturnValue("/applications");
        useRouterMock.mockReturnValue({
            push: vi.fn(),
        } as unknown as AppRouterInstance);
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams() as unknown as ReadonlyURLSearchParams,
        );
        usePaginationParamsMock.mockReturnValue([
            { limit: 10, page: 1 },
            () => undefined,
        ]);
        useScrollIntoViewMock.mockReturnValue({
            scrollIntoView: vi.fn(),
        } as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display two pagination elements", () => {
        const { container } = render(
            <Component {...defaultProps}>Children</Component>,
        );
        const paginationElements = container.querySelectorAll(
            ".mantine-Pagination-root",
        );

        expect(paginationElements.length).toBe(2);
    });

    it("should display children", () => {
        const text = "Content inside Paginated";
        render(
            <Component {...defaultProps}>
                <span>{text}</span>
            </Component>,
        );

        expect(screen.getByText(text)).toBeInTheDocument();
    });

    it("should invoke updateParams function when top pagination prev page button is clicked", async () => {
        const mockedUpdateParams = vi.fn();
        usePaginationParamsMock.mockReturnValue([
            { limit: 10, page: 2 },
            mockedUpdateParams,
        ]);
        const { container, rerender } = render(
            <Component {...defaultProps} totalCount={20}>
                Children
            </Component>,
        );
        const paginationElement = container.querySelector(
            ".mantine-Pagination-root",
        ) as HTMLDivElement;
        const prevPageButton = paginationElement.querySelector(
            "button",
        ) as HTMLButtonElement;

        fireEvent.click(prevPageButton);
        expect(mockedUpdateParams).toHaveBeenCalledWith(1, 10);
    });

    it("should invoke updateParams function when bottom pagination button is clicked", async () => {
        const mockedUpdateParams = vi.fn();
        usePaginationParamsMock.mockReturnValue([
            { limit: 10, page: 2 },
            mockedUpdateParams,
        ]);
        const mockedScrollIntoView = vi.fn();
        useScrollIntoViewMock.mockReturnValue({
            scrollIntoView: mockedScrollIntoView,
        } as any);
        const { container, rerender } = render(
            <Component {...defaultProps} totalCount={20}>
                Children
            </Component>,
        );
        const paginationElements = container.querySelectorAll(
            ".mantine-Pagination-root",
        );
        const paginationElement = paginationElements[
            paginationElements.length - 1
        ] as HTMLDivElement;
        const prevPageButton = paginationElement.querySelector(
            "button",
        ) as HTMLButtonElement;

        fireEvent.click(prevPageButton);
        expect(mockedUpdateParams).toHaveBeenCalledWith(1, 10);
        expect(mockedScrollIntoView).toHaveBeenCalled();
    });
});
