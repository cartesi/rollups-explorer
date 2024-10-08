import { describe, it } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { ERC721DepositForm } from "../src/ERC721DepositForm";
import { withMantineTheme } from "./utils/WithMantineTheme";
import {
    useAccount,
    useReadContracts,
    useWaitForTransactionReceipt,
} from "wagmi";
import {
    useSimulateErc721Approve,
    useSimulateErc721PortalDepositErc721Token,
    useWriteErc721Approve,
    useWriteErc721PortalDepositErc721Token,
} from "@cartesi/rollups-wagmi";
import { getAddress } from "viem";

vi.mock("@cartesi/rollups-wagmi");
const useSimulateErc721ApproveMock = vi.mocked(useSimulateErc721Approve, true);
const useWriteErc721ApproveMock = vi.mocked(useWriteErc721Approve, true);
const useSimulateErc721PortalDepositErc721TokenMock = vi.mocked(
    useSimulateErc721PortalDepositErc721Token,
    true,
);
const useWriteErc721PortalDepositErc721TokenMock = vi.mocked(
    useWriteErc721PortalDepositErc721Token,
    true,
);

vi.mock("wagmi");
const useReadContractsMock = vi.mocked(useReadContracts, true);
const useAccountMock = vi.mocked(useAccount, true);
const useWaitForTransactionReceiptMock = vi.mocked(
    useWaitForTransactionReceipt,
    true,
);

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

const Component = withMantineTheme(ERC721DepositForm);
const defaultProps = {
    applications: [
        "0x60a7048c3136293071605a4eaffef49923e981cc",
        "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
        "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
    ],
    isLoadingApplications: false,
    onSearchApplications: () => undefined,
    onSuccess: () => undefined,
};

describe("ERC721DepositForm", () => {
    beforeEach(() => {
        useSimulateErc721ApproveMock.mockReturnValue({ config: {} } as any);
        useWriteErc721ApproveMock.mockReturnValue({
            wait: vi.fn(),
            reset: vi.fn(),
        } as any);
        useSimulateErc721PortalDepositErc721TokenMock.mockReturnValue({
            data: {
                request: {},
            },
            config: {},
        } as any);
        useWriteErc721PortalDepositErc721TokenMock.mockReturnValue({
            wait: vi.fn(),
            reset: vi.fn(),
        } as any);
        useReadContractsMock.mockReturnValue({
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
            ],
        } as any);
        useAccountMock.mockReturnValue({
            address: "0x8FD78976f8955D13bAA4fC99043208F4EC020D7E",
        } as any);
        useWaitForTransactionReceiptMock.mockReturnValue({} as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    describe("ERC721DepositForm component", () => {
        it("should display correct label and description for applications input", () => {
            render(<Component {...defaultProps} />);

            expect(screen.getByText("Application")).toBeInTheDocument();
            expect(
                screen.getByText("The application smart contract address"),
            ).toBeInTheDocument();
        });

        it("should display correct label and description for erc721Address input", () => {
            render(<Component {...defaultProps} />);

            expect(screen.getByText("ERC-721")).toBeInTheDocument();
            expect(
                screen.getByText("The ERC-721 smart contract address"),
            ).toBeInTheDocument();
        });

        it("should display correct label and description for tokenId input", () => {
            render(<Component {...defaultProps} />);

            expect(screen.getByText("Token ID")).toBeInTheDocument();
            expect(screen.getByText("Token ID to deposit")).toBeInTheDocument();
        });

        it("should display correct balance for tokenId input", () => {
            const symbol = "ACME";
            const balance = 2n;

            const implementation = (config: any) => {
                const [contractData] = config.contracts;
                const { functionName } = contractData;
                return functionName === "tokenOfOwnerByIndex"
                    ? {
                          isLoading: false,
                          isSuccess: true,
                          data: [
                              {
                                  result: undefined,
                                  error: undefined,
                              },
                          ],
                      }
                    : {
                          isLoading: false,
                          isSuccess: true,
                          data: [
                              {
                                  result: symbol,
                                  error: undefined,
                              },
                              {
                                  result: balance,
                                  error: undefined,
                              },
                          ],
                      };
            };
            useReadContractsMock.mockImplementation(implementation as any);
            render(<Component {...defaultProps} />);

            expect(
                screen.getByText(`Balance: ${Number(balance)} ${symbol}`),
            ).toBeInTheDocument();
        });

        it("should display correct label and description for base data layer input", () => {
            render(<Component {...defaultProps} />);

            expect(screen.getByText("Base data")).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Base execution layer data handled by the application",
                ),
            ).toBeInTheDocument();
        });

        it("should display correct label and description for extra data layer input", () => {
            render(<Component {...defaultProps} />);

            expect(screen.getByText("Extra data")).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Extra execution layer data handled by the application",
                ),
            ).toBeInTheDocument();
        });

        it("should display select with available token ids when user is owner of multiple tokens", () => {
            render(<Component {...defaultProps} />);
            const data = [
                {
                    result: 1n,
                    status: "success",
                },
                {
                    result: 2n,
                    status: "success",
                },
                {
                    result: 3n,
                    status: "success",
                },
            ];
            const implementation = (config: any) => {
                const [contractData] = config.contracts;
                const { functionName } = contractData;
                return functionName === "tokenOfOwnerByIndex"
                    ? {
                          isLoading: false,
                          isSuccess: true,
                          data: [data[Number(contractData.args[1])]],
                      }
                    : {
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
                          ],
                      };
            };
            useReadContractsMock.mockImplementation(implementation as any);

            render(<Component {...defaultProps} />);
            expect(screen.getByTestId("token-id-select")).toBeInTheDocument();
        });

        it("should display input when user is not owner of tokens", async () => {
            render(<Component {...defaultProps} />);
            const implementation = (config: any) => {
                const [contractData] = config.contracts;
                const { functionName } = contractData;
                return functionName === "tokenOfOwnerByIndex"
                    ? {
                          isLoading: false,
                          isSuccess: true,
                          data: [
                              {
                                  result: undefined,
                                  error: undefined,
                              },
                          ],
                      }
                    : {
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
                          ],
                      };
            };
            useReadContractsMock.mockImplementation(implementation as any);
            expect(screen.getByTestId("token-id-input")).toBeInTheDocument();
        });

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

        it("should invoke approve.reset and deposit.reset functions after successful deposit", () => {
            const approveResetMock = vi.fn();
            useWriteErc721ApproveMock.mockReturnValue({
                data: {},
                wait: vi.fn(),
                reset: approveResetMock,
            } as any);
            const depositResetMock = vi.fn();
            useWriteErc721PortalDepositErc721TokenMock.mockReturnValue({
                data: {},
                wait: vi.fn(),
                reset: depositResetMock,
            } as any);
            useWaitForTransactionReceiptMock.mockReturnValue({
                error: null,
                isSuccess: true,
            } as any);

            render(<Component {...defaultProps} />);

            expect(approveResetMock).toHaveBeenCalled();
            expect(depositResetMock).toHaveBeenCalled();
        });

        it("should invoke onSuccess callback after successful deposit", async () => {
            const wagmi = await import("wagmi");
            wagmi.useWaitForTransactionReceipt = vi.fn().mockReturnValue({
                ...wagmi.useWaitForTransactionReceipt,
                error: null,
                isSuccess: true,
            });

            const onSuccessMock = vi.fn();
            render(<Component {...defaultProps} onSuccess={onSuccessMock} />);

            expect(onSuccessMock).toHaveBeenCalled();
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
            expect(screen.getByText("Invalid application")).toBeInTheDocument();
        });

        it("should correctly format address", () => {
            const mockedHook = vi.fn().mockReturnValue({
                loading: false,
                error: null,
            });

            useSimulateErc721PortalDepositErc721TokenMock.mockImplementation(
                mockedHook,
            );

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
                    "0x",
                ],
                query: {
                    enabled: false,
                },
            });
        });

        it("should not initially show token id input/select", () => {
            useReadContractsMock.mockReturnValue({
                isLoading: false,
                isSuccess: false,
                data: undefined,
            } as any);
            render(<Component {...defaultProps} />);
            expect(() => screen.getByTestId("token-id-select")).toThrow(
                "Unable to find an element",
            );

            const collapse = screen
                .getByTestId("token-id-input")
                .closest("[aria-hidden='true']") as HTMLDivElement;

            expect(collapse).toBeInTheDocument();
        });

        it("should correctly format base and extra layer data", () => {
            const mockedHook = vi.fn().mockReturnValue({
                loading: false,
                error: null,
            });

            useSimulateErc721PortalDepositErc721TokenMock.mockImplementation(
                mockedHook,
            );

            const { container } = render(<Component {...defaultProps} />);
            const textareas = container.querySelectorAll("textarea");
            const baseLayerDataInput = textareas[0] as HTMLTextAreaElement;
            const execLayerDataInput = textareas[1] as HTMLTextAreaElement;

            const hexValue = "0x123123";
            fireEvent.change(baseLayerDataInput, {
                target: {
                    value: hexValue,
                },
            });
            fireEvent.change(execLayerDataInput, {
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
                    hexValue,
                ],
                query: {
                    enabled: false,
                },
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

            useWaitForTransactionReceiptMock.mockReturnValue({
                error: null,
                isSuccess: true,
            } as any);

            render(<Component {...defaultProps} />);
            expect(resetMock).toHaveBeenCalled();
        });
    });
});
