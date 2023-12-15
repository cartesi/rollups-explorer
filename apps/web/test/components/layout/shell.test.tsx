import { render, screen, within } from "@testing-library/react";
import { afterAll, describe, it } from "vitest";
import withMantineTheme from "../../utils/WithMantineTheme";
import Shell from "../../../src/components/layout/shell";

const Component = withMantineTheme(Shell);

vi.mock("../../../src/graphql", async () => {
    return {
        useApplicationsQuery: () => [{ data: {}, fetching: false }],
        useTokensQuery: () => [{ data: {}, fetching: false }],
    };
});

vi.mock("@cartesi/rollups-wagmi", async () => {
    return {
        usePrepareInputBoxAddInput: () => ({
            config: {},
        }),
        useInputBoxAddInput: () => ({
            data: {},
            wait: vi.fn(),
        }),
    };
});

vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...(actual as any),
        getAddress: (address: string) => address,
    };
});

vi.mock("@rainbow-me/rainbowkit", async () => {
    return {
        ConnectButton: () => <></>,
    };
});

vi.mock("@cartesi/rollups-wagmi", async () => {
    const actual = await vi.importActual("@cartesi/rollups-wagmi");
    return {
        ...(actual as any),
        usePrepareErc20Approve: () => ({
            config: {},
        }),
        useErc20Approve: () => ({
            data: {},
            wait: vi.fn(),
        }),
        usePrepareErc20PortalDepositErc20Tokens: () => ({
            config: {},
        }),
        useErc20PortalDepositErc20Tokens: () => ({
            data: {},
            wait: vi.fn(),
        }),
        usePrepareEtherPortalDepositEther: () => ({
            config: {},
        }),
        useEtherPortalDepositEther: () => ({
            data: {},
            wait: vi.fn(),
        }),
    };
});

vi.mock("wagmi", async () => {
    return {
        useContractReads: () => ({
            isLoading: false,
            isSuccess: true,
            data: [
                {
                    result: undefined,
                    error: undefined,
                },
                {
                    result: undefined,
                    error: undefined,
                },
                {
                    result: undefined,
                    error: undefined,
                },
                {
                    result: undefined,
                    error: undefined,
                },
            ],
        }),
        useAccount: () => ({
            address: "0x8FD78976f8955D13bAA4fC99043208F4EC020D7E",
        }),
        usePrepareContractWrite: () => ({}),
        useWaitForTransaction: () => ({}),
        useContractWrite: () => ({}),
        useNetwork: () => ({
            chain: {
                nativeCurrency: {
                    decimals: 18,
                },
            },
        }),
    };
});

describe("Shell component", () => {
    afterAll(() => {
        vi.restoreAllMocks();
    });

    describe("Cartesi logo", () => {
        it("should be wrapped in a anchor element with href to index route", () => {
            const { container } = render(<Component>Children</Component>);
            const logo = container.querySelector("svg") as SVGSVGElement;
            const logoLink = logo.closest("a") as HTMLAnchorElement;

            expect(logoLink.getAttribute("href")).toBe("/");
        });
    });

    describe("Header", () => {
        it("should display transaction link in header", () => {
            render(<Component>Children</Component>);

            expect(
                within(screen.getByTestId("header")).getByTestId(
                    "transaction-button",
                ),
            ).toBeInTheDocument();
        });

        it("should not display home and applications links in header", () => {
            render(<Component>Children</Component>);

            expect(() =>
                within(screen.getByTestId("header")).getByTestId("home-link"),
            ).toThrow("Unable to find an element");

            expect(() =>
                within(screen.getByTestId("header")).getByTestId(
                    "applications-link",
                ),
            ).toThrow("Unable to find an element");
        });
    });

    describe("Navbar", () => {
        it("should display home and applications links in navbar", () => {
            render(<Component>Children</Component>);

            expect(
                within(screen.getByTestId("navbar")).getByTestId("home-link"),
            ).toBeInTheDocument();
            expect(
                within(screen.getByTestId("navbar")).getByTestId(
                    "applications-link",
                ),
            ).toBeInTheDocument();
        });

        it("should display navbar on desktop", () => {
            const { container } = render(<Component>Children</Component>);
            const navbar = container.querySelector(
                ".mantine-AppShell-navbar",
            ) as HTMLDivElement;

            expect(navbar).toBeVisible();
        });
    });
});
