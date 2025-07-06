import { afterAll, beforeEach, describe, it } from "vitest";
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { useAccount } from "wagmi";
import { Applications } from "../../../src/components/applications/applications";
import { withMantineTheme } from "../../utils/WithMantineTheme";
import {
    useApplicationsConnectionOwnerQuery,
    useApplicationsConnectionQuery,
} from "@cartesi/rollups-explorer-domain/explorer-hooks";
import userEvent from "@testing-library/user-event";
import {
    ReadonlyURLSearchParams,
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import { useUrlSearchParams } from "../../../src/hooks/useUrlSearchParams";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

vi.mock("next/navigation");
const usePathnameMock = vi.mocked(usePathname, true);
const useRouterMock = vi.mocked(useRouter, true);
const useSearchParamsMock = vi.mocked(useSearchParams, true);

vi.mock("../../../src/hooks/useUrlSearchParams");
const useUrlSearchParamsMock = vi.mocked(useUrlSearchParams, true);

vi.mock("wagmi");
vi.mock("@cartesi/rollups-explorer-domain/explorer-hooks");

const useAccountMock = vi.mocked(useAccount, true);
const useAccountData = {
    address: "0x8FD78976f8955D13bAA4fC99043208F4EC020D7E",
    isConnected: true,
};
const useApplicationsConnectionOwnerQueryMock = vi.mocked(
    useApplicationsConnectionOwnerQuery,
    true,
);
const useApplicationsConnectionQueryMock = vi.mocked(
    useApplicationsConnectionQuery,
    true,
);

const Component = withMantineTheme(Applications);

const IntersectionObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
}));

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

describe("Applications component", () => {
    beforeEach(() => {
        useAccountMock.mockReturnValue(useAccountData as any);
        useApplicationsConnectionOwnerQueryMock.mockReturnValue([
            {
                data: {
                    applicationsConnection: {
                        edges: [],
                    },
                },
                fetching: false,
            },
        ] as any);
        useApplicationsConnectionQueryMock.mockReturnValue([
            {
                data: {
                    applicationsConnection: {
                        edges: [],
                    },
                },
                fetching: false,
            },
        ] as any);

        usePathnameMock.mockReturnValue("/applications");
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

    afterAll(() => {
        vi.resetAllMocks();
        cleanup();
    });

    it("should display all applications tab by default", () => {
        render(<Component />);
        expect(screen.getByTestId("all-applications")).toBeInTheDocument();
    });

    it("should display tabs when wallet is connected", () => {
        useAccountMock.mockReturnValue({
            ...useAccountData,
            isConnected: true,
        } as any);
        render(<Component />);
        expect(screen.getByText("All Apps")).toBeInTheDocument();
        expect(screen.getByText("My Apps")).toBeInTheDocument();
    });

    it("should display tabs when wallet is not connected", () => {
        useAccountMock.mockReturnValue({
            ...useAccountData,
            isConnected: false,
        } as any);
        render(<Component />);
        expect(screen.getByText("All Apps")).toBeInTheDocument();
        expect(screen.getByText("My Apps")).toBeInTheDocument();
    });

    it("should display correct content when tab is selected", () => {
        render(<Component />);
        const myAppsButton = screen.getByText("My Apps")
            .parentNode as HTMLButtonElement;

        fireEvent.click(myAppsButton);
        expect(screen.getByTestId("user-applications")).toBeInTheDocument();

        const AllAppsButton = screen.getByText("All Apps")
            .parentNode as HTMLButtonElement;

        fireEvent.click(AllAppsButton);
        expect(screen.getByTestId("all-applications")).toBeInTheDocument();
    });

    it("should search for specific application", async () => {
        const address = "0xccebaa7e541bcaa99de39ca248f0aa6cd33f9e3e";

        useApplicationsConnectionQueryMock.mockReturnValue([
            {
                data: {
                    applicationsConnection: {
                        edges: [
                            {
                                node: {
                                    id: "11155111-0xccebaa7e541bcaa99de39ca248f0aa6cd33f9e3e-v2",
                                    address,
                                    rollupVersion: "v2",
                                    __typename: "Application",
                                    owner: "0x0000000000000000000000000000000000000000",
                                    timestamp: "1749557112",
                                    factory: {
                                        id: "11155111-0xc7006f70875bade89032001262a846d3ee160051",
                                        address:
                                            "0xc7006f70875bade89032001262a846d3ee160051",
                                        __typename: "ApplicationFactory",
                                    },
                                },
                            },
                        ],
                    },
                },
                fetching: false,
            },
        ] as any);

        render(<Component />);

        const searchInput = screen.getByTestId("search-input");
        fireEvent.focus(searchInput);

        await waitFor(() => userEvent.type(searchInput, address), {
            timeout: 3000,
        });
        await waitFor(
            () =>
                expect(
                    useApplicationsConnectionQueryMock,
                ).toHaveBeenLastCalledWith({
                    variables: {
                        after: undefined,
                        limit: 10,
                        orderBy: "timestamp_DESC",
                        where: {
                            OR: [
                                {
                                    owner_startsWith: address,
                                },
                            ],
                            address_startsWith: address,
                            chain: {
                                id_eq: "11155111",
                            },
                        },
                    },
                }),
            {
                timeout: 1000,
            },
        );
    });
});
