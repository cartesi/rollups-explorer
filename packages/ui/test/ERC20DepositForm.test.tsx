import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it } from "vitest";
import { ERC20DepositForm } from "../src";
import withMantineTheme from "./utils/WithMantineTheme";
import { getAddress } from "viem";

const Component = withMantineTheme(ERC20DepositForm);

const applications = [
    "0x60a7048c3136293071605a4eaffef49923e981cc",
    "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
    "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
];

const tokens = [
    "SIM20 - SimpleERC20 - 0x059c7507b973d1512768c06f32a813bc93d83eb2",
    "SIM20 - SimpleERC20 - 0x13bf42f9fed0d0d2708fbfdb18e80469d664fc14",
    "SIM20 - SimpleERC20 - 0xa46e0a31a1c248160acba9dd354c72e52c92c9f2",
];

const mockChangeTokenQuery = vi.fn();
const mockChangeApplicationQuery = vi.fn();

const defaultProps = {
    applications,
    tokens,
    isLoadingApplications: false,
    onSearchApplications: () => undefined,
    onSearchTokens: () => undefined,
    tokensQuery: mockChangeTokenQuery,
    applicationsQuery: mockChangeApplicationQuery,
};

vi.mock("@cartesi/rollups-wagmi", async () => {
    const actual = await vi.importActual("@cartesi/rollups-wagmi");
    return {
        ...(actual as any),
        useSimulateErc20Approve: () => ({
            data: {
                request: {},
            },
            config: {},
        }),
        useWriteErc20Approve: () => ({
            data: {},
            wait: vi.fn(),
        }),
        useSimulateErc20PortalDepositErc20Tokens: () => ({
            data: {
                request: {},
            },
            config: {},
        }),
        useWriteErc20PortalDepositErc20Tokens: () => ({
            data: {},
            wait: vi.fn(),
        }),
    };
});

vi.mock("wagmi", async () => {
    return {
        useReadContracts: () => ({
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
        useWaitForTransactionReceipt: () => ({}),
    };
});

vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...(actual as any),
        getAddress: (address: string) => address,
    };
});

vi.mock("@mantine/form", async () => {
    const actual = await vi.importActual("@mantine/form");
    return {
        ...(actual as any),
        useForm: (actual as any).useForm,
    };
});
vi.mock("../src/hooks/useWatchQueryOnBlockChange", () => ({
    default: () => undefined,
}));

describe("Rollups ERC20DepositForm", () => {
    describe("ApplicationAutocomplete", () => {
        it("should display correct label", () => {
            render(<Component {...defaultProps} />);

            expect(screen.getByText("Application")).toBeInTheDocument();
        });

        it("should display correct description", () => {
            render(<Component {...defaultProps} />);

            expect(
                screen.getByText("The application smart contract address"),
            ).toBeInTheDocument();
        });

        it("should display correct placeholder", () => {
            const { container } = render(<Component {...defaultProps} />);
            const input = container.querySelector("input");

            expect(input?.getAttribute("placeholder")).toBe("0x");
        });

        it("should display alert for undeployed application", async () => {
            const customProps = { ...defaultProps, applications: [] };
            render(<Component {...customProps} />);
            const input = screen.getByTestId("application") as HTMLInputElement;

            fireEvent.change(input, {
                target: {
                    value: "0x60a7048c3136293071605a4eaffef49923e981fe",
                },
            });

            await waitFor(
                () =>
                    expect(
                        screen.getByText(
                            "This is a deposit to an undeployed application.",
                        ),
                    ).toBeInTheDocument(),
                {
                    timeout: 1100,
                },
            );
        });

        it("should display error when application is invalid", () => {
            const { container } = render(<Component {...defaultProps} />);
            const input = container.querySelector("input") as HTMLInputElement;

            fireEvent.change(input, {
                target: {
                    value: "0x60a7048c3136293071605a4eaffef49923e981ccffffffff",
                },
            });

            fireEvent.blur(input);

            expect(input.getAttribute("aria-invalid")).toBe("true");
            expect(
                screen.getByText("Invalid Application address"),
            ).toBeInTheDocument();
        });

        it("should correctly format address", async () => {
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            const mockedHook = vi.fn().mockReturnValue({
                ...rollupsWagmi.usePrepareErc20PortalDepositErc20Tokens,
                loading: false,
                error: null,
            });
            rollupsWagmi.usePrepareErc20PortalDepositErc20Tokens = vi
                .fn()
                .mockImplementation(mockedHook);

            const { container } = render(<Component {...defaultProps} />);
            const input = container.querySelector("input") as HTMLInputElement;

            const [application] = defaultProps.applications;
            fireEvent.change(input, {
                target: {
                    value: application,
                },
            });

            expect(mockedHook).toHaveBeenLastCalledWith({
                args: [
                    "0x0000000000000000000000000000000000000000",
                    getAddress(application),
                    undefined,
                    "0x",
                ],
                enabled: false,
            });
        });
    });

    describe("TokenAutocomplete", () => {
        it("should display correct label", () => {
            render(<Component {...defaultProps} />);

            expect(screen.getByText("ERC-20")).toBeInTheDocument();
        });

        it("should display correct description", () => {
            render(<Component {...defaultProps} />);

            expect(
                screen.getByText("The ERC-20 smart contract address"),
            ).toBeInTheDocument();
        });

        it("should display correct placeholder", () => {
            const { container } = render(<Component {...defaultProps} />);
            const input = container.querySelector("input");

            expect(input?.getAttribute("placeholder")).toBe("0x");
        });

        it("should display alert for first deposit of the selected token", () => {
            const customProps = { ...defaultProps, tokens: [] };
            render(<Component {...customProps} />);
            const input = screen.getByTestId(
                "erc20Address",
            ) as HTMLInputElement;

            fireEvent.change(input, {
                target: {
                    value: "0x60a7048c3136293071605a4eaffef49923e981fe",
                },
            });

            expect(
                screen.getByText("This is the first deposit of that token."),
            ).toBeInTheDocument();
        });

        it("should display error for invalid address", () => {
            render(<Component {...defaultProps} />);
            const input = screen.getByTestId(
                "erc20Address",
            ) as HTMLInputElement;

            fireEvent.change(input, {
                target: {
                    value: "0x777",
                },
            });

            fireEvent.blur(input);
            expect(
                screen.getByText("Invalid ERC20 address"),
            ).toBeInTheDocument();
        });
    });

    describe("Amount input", () => {
        it("should not allow non-digit symbols", () => {
            render(<Component {...defaultProps} />);
            const amountInput = screen.getByTestId("amount-input");

            fireEvent.change(amountInput, {
                target: {
                    value: "abc",
                },
            });

            const matchingInputs = screen
                .getAllByDisplayValue("")
                .filter(
                    (element) =>
                        element.getAttribute("data-testid") === "amount-input",
                );
            expect(matchingInputs.length).toBe(1);
        });

        it("should allow digit symbols", async () => {
            render(<Component {...defaultProps} />);
            const amountInput = screen.getByTestId(
                "amount-input",
            ) as HTMLInputElement;
            const value = "123";

            fireEvent.change(amountInput, {
                target: {
                    value,
                },
            });

            expect(screen.getByDisplayValue(value) === amountInput).toBe(true);
        });

        it("should correctly process small decimal numbers", async () => {
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            const mockedHook = vi.fn().mockReturnValue({
                ...rollupsWagmi.usePrepareErc20Approve,
                loading: false,
                error: null,
            });
            rollupsWagmi.usePrepareErc20Approve = vi
                .fn()
                .mockImplementation(mockedHook);

            const { container } = render(<Component {...defaultProps} />);
            const amountInput = container.querySelector(
                '[type="number"]',
            ) as HTMLInputElement;

            fireEvent.change(amountInput, {
                target: {
                    value: "0.0000001",
                },
            });

            expect(mockedHook).toHaveBeenLastCalledWith({
                address: "0x0000000000000000000000000000000000000000",
                args: [
                    "0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB",
                    100000000000n,
                ],
                enabled: true,
            });
        });
    });
    describe("Max Amount Button", () => {
        vi.mock("wagmi", async () => {
            return {
                useReadContracts: () => ({
                    isLoading: false,
                    isSuccess: true,
                    data: [
                        {
                            result: 18,
                            status: "success",
                        },
                        {
                            result: "KNI",
                            status: "success",
                        },
                        {
                            result: 0n,
                            status: "success",
                        },
                        {
                            result: 50000000000000000000n,
                            status: "success",
                        },
                    ],
                }),
                useAccount: () => ({
                    address: "0xaBe5271e041df23C9f7C0461Df5D340A0C1C36F4",
                }),
                useWaitForTransactionReceipt: () => ({}),
            };
        });
        it("should display max button when the balance is more than 0", () => {
            vi.mock("wagmi", async () => {
                return {
                    useReadContracts: () => ({
                        isLoading: false,
                        isSuccess: true,
                        data: [
                            {
                                result: 18,
                                status: "success",
                            },
                            {
                                result: "KNI",
                                status: "success",
                            },
                            {
                                result: 0n,
                                status: "success",
                            },
                            {
                                result: 50000000000000000000n,
                                status: "success",
                            },
                        ],
                    }),
                    useAccount: () => ({
                        address: "0xaBe5271e041df23C9f7C0461Df5D340A0C1C36F4",
                    }),
                    useWaitForTransactionReceipt: () => ({}),
                };
            });
            render(<Component {...defaultProps} />);
            const tokenInput = screen.getByTestId(
                "erc20Address",
            ) as HTMLInputElement;
            expect(screen.getByText(50)).toBeInTheDocument();
            expect(screen.getByText("KNI")).toBeInTheDocument();
            expect(screen.getByText("Max")).toBeInTheDocument();
        });
        it("sets the input value to match the balance when the max button is clicked", () => {
            render(<Component {...defaultProps} />);
            const amountInput = screen.getByTestId(
                "amount-input",
            ) as HTMLInputElement;
            const maxButton = screen.getByTestId("max-button");
            fireEvent.click(maxButton);
            expect(amountInput.value).toBe("50");
        });
    });

    describe("Amount input", () => {
        it("should correctly process small decimal numbers", async () => {
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            const mockedHook = vi.fn().mockReturnValue({
                ...rollupsWagmi.useSimulateErc20Approve,
                data: {
                    request: {},
                },
                loading: false,
                error: null,
            });
            rollupsWagmi.useSimulateErc20Approve = vi
                .fn()
                .mockImplementation(mockedHook);

            const { container } = render(<Component {...defaultProps} />);
            const amountInput = container.querySelector(
                '[type="number"]',
            ) as HTMLInputElement;

            fireEvent.change(amountInput, {
                target: {
                    value: "0.0000001",
                },
            });

            expect(mockedHook).toHaveBeenLastCalledWith({
                address: "0x0000000000000000000000000000000000000000",
                args: [
                    "0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB",
                    100000000000n,
                ],
                query: {
                    enabled: true,
                },
            });
        });
    });

    describe("Deposit button", () => {
        it("should invoke onSearchApplications function after successful deposit", async () => {
            const wagmi = await import("wagmi");
            wagmi.useWaitForTransactionReceipt = vi.fn().mockReturnValue({
                ...wagmi.useWaitForTransactionReceipt,
                error: null,
                isSuccess: true,
            });

            const onSearchApplicationsMock = vi.fn();
            render(
                <Component
                    {...defaultProps}
                    onSearchApplications={onSearchApplicationsMock}
                />,
            );

            expect(onSearchApplicationsMock).toHaveBeenCalledWith("");
        });

        it("should correctly format extra data", async () => {
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            const mockedHook = vi.fn().mockReturnValue({
                ...rollupsWagmi.usePrepareErc20PortalDepositErc20Tokens,
                loading: false,
                error: null,
            });
            rollupsWagmi.usePrepareErc20PortalDepositErc20Tokens = vi
                .fn()
                .mockImplementation(mockedHook);

            const { container } = render(<Component {...defaultProps} />);
            const textarea = container.querySelector(
                "textarea",
            ) as HTMLTextAreaElement;

            const hexValue = "0x123123";
            fireEvent.change(textarea, {
                target: {
                    value: hexValue,
                },
            });

            expect(mockedHook).toHaveBeenLastCalledWith({
                args: [
                    "0x0000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000",
                    undefined,
                    hexValue,
                ],
                enabled: false,
            });
        });
    });

    describe("Form", () => {
        it("should reset form after successful submission", async () => {
            const mantineForm = await import("@mantine/form");
            const [application] = defaultProps.applications;
            const resetMock = vi.fn();
            vi.spyOn(mantineForm, "useForm").mockReturnValue({
                getTransformedValues: () => ({
                    address: getAddress(application),
                    rawInput: "0x",
                }),
                isValid: () => true,
                getInputProps: () => {},
                errors: {},
                setFieldValue: () => "",
                reset: resetMock,
            } as any);

            const wagmi = await import("wagmi");
            wagmi.useWaitForTransaction = vi.fn().mockReturnValue({
                ...wagmi.useWaitForTransaction,
                error: null,
                status: "success",
            });

            render(<Component {...defaultProps} />);
            expect(resetMock).toHaveBeenCalled();
        });
    });
});
