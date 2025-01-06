import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
import Search from "../../src/components/search";

vi.mock("next/navigation");
const usePathnameMock = vi.mocked(usePathname, true);
const useRouterMock = vi.mocked(useRouter, true);
const useSearchParamsMock = vi.mocked(useSearchParams, true);

vi.mock("../../src/hooks/useUrlSearchParams");
const useUrlSearchParamsMock = vi.mocked(useUrlSearchParams, true);

const Component = withMantineTheme(Search);
const queryAddress = "0xF94C3d8dB01c4CF428d5DBeDC514B4c5f2FcE6F0";
const defaultProps = {
    isLoading: false,
    onChange: () => vi.fn(),
};

describe("Search Component", () => {
    beforeEach(() => {
        usePathnameMock.mockReturnValue("/inputs");
        useRouterMock.mockReturnValue({
            push: vi.fn(),
        } as unknown as AppRouterInstance);
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams() as unknown as ReadonlyURLSearchParams,
        );

        useUrlSearchParamsMock.mockReturnValue([
            { limit: 10, page: 1, query: "" },
            vi.fn(),
        ]);
    });
    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display loader when fetching data", async () => {
        const customProps = { ...defaultProps, isLoading: true };
        render(<Component {...customProps} />);
        const searchInput = screen.getByTestId("search-input");
        fireEvent.focus(searchInput);
        await waitFor(() => userEvent.type(searchInput, queryAddress));
        await waitFor(
            () =>
                expect(
                    screen.getByLabelText("loader-input"),
                ).toBeInTheDocument(),
            {
                timeout: 500,
            },
        );
    });
    it("should have the same value between query and keyword", async () => {
        const mockedUpdateParams = vi.fn();
        const initialQuery = "0x872";

        useUrlSearchParamsMock.mockReturnValue([
            { limit: 10, page: 1, query: initialQuery },
            mockedUpdateParams,
        ]);
        render(<Component {...defaultProps} />);
        const searchInput = screen.getByTestId(
            "search-input",
        ) as HTMLInputElement;
        expect(searchInput.value).toBe(initialQuery);
    });
    it("should call updateQueryParams hooks when input change", async () => {
        const mockedUpdateParams = vi.fn();
        useUrlSearchParamsMock.mockReturnValue([
            { limit: 10, page: 1, query: "" },
            mockedUpdateParams,
        ]);
        render(<Component {...defaultProps} />);
        const searchInput = screen.getByTestId("search-input");
        fireEvent.focus(searchInput);
        await waitFor(() => userEvent.type(searchInput, queryAddress));
        await waitFor(
            () =>
                expect(mockedUpdateParams).toHaveBeenCalledWith(
                    1,
                    10,
                    queryAddress,
                ),
            {
                timeout: 400,
            },
        );
    });
});
