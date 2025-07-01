import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import {
    ReadonlyURLSearchParams,
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import { describe } from "vitest";
import { useUrlSearchParams } from "../../src/hooks/useUrlSearchParams";
import { withMantineTheme } from "../utils/WithMantineTheme";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import FilterVersion from "../../src/components/versionsFilter";

vi.mock("next/navigation");
const usePathnameMock = vi.mocked(usePathname, true);
const useRouterMock = vi.mocked(useRouter, true);
const useSearchParamsMock = vi.mocked(useSearchParams, true);

vi.mock("../../src/hooks/useUrlSearchParams");
const useUrlSearchParamsMock = vi.mocked(useUrlSearchParams, true);

const Component = withMantineTheme(FilterVersion);
const defaultProps = {
    isLoading: false,
    onChange: () => vi.fn(),
};

describe("Versions Filter Component", () => {
    beforeEach(() => {
        usePathnameMock.mockReturnValue("/inputs");
        useRouterMock.mockReturnValue({
            push: vi.fn(),
        } as unknown as AppRouterInstance);
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams() as unknown as ReadonlyURLSearchParams,
        );

        useUrlSearchParamsMock.mockReturnValue([
            { limit: 10, page: 1, query: "", version: "" },
            vi.fn(),
        ]);
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should render v1 and v2 menu items", async () => {
        render(<Component {...defaultProps} />);

        fireEvent.click(screen.getByTestId("versions-filter-trigger"));

        await waitFor(() => {
            expect(screen.getByText("Rollups v1")).toBeVisible();
            expect(screen.getByText("Rollups v2")).toBeVisible();
        });
    });

    it("should be able to select v1 and v2 menu items", async () => {
        const mockedUpdateParams = vi.fn();
        useUrlSearchParamsMock.mockReturnValue([
            { limit: 10, page: 1, query: "", version: "" },
            mockedUpdateParams,
        ]);
        render(<Component {...defaultProps} />);

        fireEvent.click(screen.getByTestId("versions-filter-trigger"));
        await waitFor(() =>
            expect(screen.getByText("Rollups v1")).toBeVisible(),
        );

        fireEvent.click(screen.getByText("Rollups v1"));
        fireEvent.click(screen.getByText("Rollups v2"));
        fireEvent.click(screen.getByText("Apply"));

        await waitFor(
            () =>
                expect(mockedUpdateParams).toHaveBeenCalledWith(
                    1,
                    10,
                    "",
                    "v1,v2",
                ),
            {
                timeout: 600,
            },
        );
    });

    it("should be able to clear filters", async () => {
        const mockedUpdateParams = vi.fn();
        useUrlSearchParamsMock.mockReturnValue([
            { limit: 10, page: 1, query: "", version: "" },
            mockedUpdateParams,
        ]);
        render(<Component {...defaultProps} />);

        fireEvent.click(screen.getByTestId("versions-filter-trigger"));
        await waitFor(() =>
            expect(screen.getByText("Rollups v1")).toBeVisible(),
        );

        fireEvent.click(screen.getByText("Rollups v1"));
        fireEvent.click(screen.getByText("Rollups v2"));
        fireEvent.click(screen.getByText("Clear"));

        await waitFor(
            () =>
                expect(mockedUpdateParams).toHaveBeenCalledWith(1, 10, "", ""),
            {
                timeout: 600,
            },
        );
    });

    it("should be able to sync filters with url query", async () => {
        const onChangeSpy = vi.fn();
        useUrlSearchParamsMock.mockReturnValue([
            { limit: 10, page: 1, query: "", version: "v1,v2" },
            vi.fn(),
        ]);
        render(<Component {...defaultProps} onChange={onChangeSpy} />);

        await waitFor(() =>
            expect(onChangeSpy).toHaveBeenCalledWith(["v1", "v2"]),
        );
    });

    it("should display spinner while loading", async () => {
        const mockedUpdateParams = vi.fn();
        useUrlSearchParamsMock.mockReturnValue([
            { limit: 10, page: 1, query: "", version: "" },
            mockedUpdateParams,
        ]);
        render(<Component {...defaultProps} isLoading />);

        const trigger = screen.getByTestId("versions-filter-trigger");
        expect(trigger.getAttribute("data-loading")).toBe("true");
    });
});
