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
import { useQueryParams } from "../../src/hooks/useQueryParams";
import { withMantineTheme } from "../utils/WithMantineTheme";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Search from "../../src/components/search";

vi.mock("next/navigation");
const usePathnameMock = vi.mocked(usePathname, true);
const useRouterMock = vi.mocked(useRouter, true);
const useSearchParamsMock = vi.mocked(useSearchParams, true);

vi.mock("../../src/hooks/useQueryParams");
const useQueryParamsMock = vi.mocked(useQueryParams, true);

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
        useQueryParamsMock.mockReturnValue({
            query: "",
            updateQueryParams: (value: string) => undefined,
        });
    });
    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display search input element", async () => {
        render(<Component {...defaultProps} />);
        const searchInput = screen.getByTestId("search-input");
        expect(searchInput).toBeInTheDocument();
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

    it("should call updateQueryParams hooks when input change", async () => {
        const mockedUpdateParams = vi.fn();

        useQueryParamsMock.mockReturnValue({
            query: "",
            updateQueryParams: mockedUpdateParams,
        });
        render(<Component {...defaultProps} />);
        const searchInput = screen.getByTestId("search-input");
        fireEvent.focus(searchInput);
        await waitFor(() => userEvent.type(searchInput, queryAddress));
        await waitFor(
            () => expect(mockedUpdateParams).toHaveBeenCalledWith(queryAddress),
            {
                timeout: 500,
            },
        );
    });
});
