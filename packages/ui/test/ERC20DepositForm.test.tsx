import { fireEvent, render, screen } from "@testing-library/react";
import { isObject } from "@vitest/utils";
import { describe, it } from "vitest";
import { ERC20DepositForm } from "../src/ERC20DepositForm";
import withMantineTheme from "./utils/WithMantineTheme";

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

const defaultApplicationProps = {
    applications,
    application: applications[0],
    isLoading: false,
    onChange: () => undefined,
};

const defaultTokenProps = {
    tokens,
    erc20Address: tokens[0],
    error: "",
    isLoading: false,
    onChange: () => undefined,
};

const defaultProps = {
    applications,
    tokens,
    isLoadingApplications: false,
    onSearchApplications: () => undefined,
};

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
        useWaitForTransaction: () => ({}),
    };
});

vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...(actual as any),
        getAddress: (address: string) => address,
    };
});

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

        it("should display alert for unemployed application", () => {
            render(
                <Component
                    {...defaultApplicationProps}
                    application="undeployed-application"
                />,
            );

            expect(
                screen.getByText(
                    "This is a deposit to an undeployed application.",
                ),
            ).toBeInTheDocument();
        });

        it("should should set input value to selected application", () => {
            const selectedApplication = applications[1];
            const { container } = render(
                <ApplicationAutoCompleteComponent
                    {...defaultApplicationProps}
                    application={selectedApplication}
                />,
            );
            const input = container.querySelector("input");

            expect(input?.getAttribute("value")).toBe(selectedApplication);
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
            render(
                <Component
                    {...defaultTokenProps}
                    erc20Address="undeployed-address"
                />,
            );

            expect(
                screen.getByText("This is the first deposit of that token."),
            ).toBeInTheDocument();
        });

        it("should should set input value to selected application", () => {
            const selectedToken = tokens[1].substring(tokens[1].indexOf("0x"));
            const { container } = render(
                <Component
                    {...defaultTokenProps}
                    erc20Address={selectedToken}
                />,
            );
            const input = container.querySelector("input");

            expect(input?.getAttribute("value")).toBe(selectedToken);
        });

        it("should display error", () => {
            const error = "Some error";
            render(<Component {...defaultProps} error={error} />);

            expect(screen.getByText(error)).toBeInTheDocument();
        });

        it("should display spinner while loading", () => {
            const { container } = render(
                <Component {...defaultProps} isLoading />,
            );
            const rightSlot = container.querySelector(
                '[data-position="right"]',
            );

            expect(isObject(rightSlot)).toBe(true);
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
    });
    describe("Max Amount Button", () => {
        vi.mock("wagmi", async () => {
            return {
                useContractReads: () => ({
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
                useWaitForTransaction: () => ({}),
            };
        });
        it("should display max button when the balance is more than 0", () => {
            vi.mock("wagmi", async () => {
                return {
                    useContractReads: () => ({
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
                    useWaitForTransaction: () => ({}),
                };
            });
            render(<Component {...defaultProps} />);
            const tokenInput = screen.getByTestId(
                "token-input",
            ) as HTMLInputElement;
            const value = "0x3Ea829Fd1b0798edF21D7b0aa7cd720e5faa4f7b";

            fireEvent.change(tokenInput, {
                target: {
                    value,
                },
            });
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
});
