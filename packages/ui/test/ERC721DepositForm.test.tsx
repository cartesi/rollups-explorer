import { describe, it } from "vitest";
import {
    render,
    screen,
    renderHook,
    cleanup,
    waitFor,
} from "@testing-library/react";
import {
    ERC721DepositForm,
    useTokensOfOwnerByIndex,
} from "../src/ERC721DepositForm";
import { withMantineTheme } from "./utils/WithMantineTheme";
import {
    Address,
    useContractReads,
    useAccount,
    useWaitForTransaction,
} from "wagmi";
import {
    usePrepareErc721Approve,
    useErc721Approve,
    usePrepareErc721PortalDepositErc721Token,
    useErc721PortalDepositErc721Token,
} from "@cartesi/rollups-wagmi";

vi.mock("@cartesi/rollups-wagmi");
const mockUsePrepareErc721Approve = vi.mocked(usePrepareErc721Approve, true);
const mockUseErc721Approve = vi.mocked(useErc721Approve, true);
const mockUsePrepareErc721PortalDepositErc721Token = vi.mocked(
    usePrepareErc721PortalDepositErc721Token,
    true,
);
const mockUseErc721PortalDepositErc721Token = vi.mocked(
    useErc721PortalDepositErc721Token,
    true,
);

vi.mock("wagmi");
const mockUseContractReads = vi.mocked(useContractReads, true);
const mockUseAccount = vi.mocked(useAccount, true);
const mockUseWaitForTransaction = vi.mocked(useWaitForTransaction, true);

vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...(actual as any),
        getAddress: (address: string) => address,
    };
});

const Component = withMantineTheme(ERC721DepositForm);
const defaultProps = {
    applications: [
        "0x60a7048c3136293071605a4eaffef49923e981cc",
        "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
        "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
    ],
    isLoadingApplications: false,
    onSearchApplications: () => undefined,
};
const contracts = [
    "0x569DABb4F67770cc094d09Fe4bf4202557d2f456",
    "0xaca048D528383cCf84d0edd511130E91eAF6d55C",
    "0x25CbF5d10Eb0C1B3eC81Eb9Ca4B6f8AE4275f958",
];

describe("ERC721DepositForm", () => {
    beforeEach(() => {
        mockUsePrepareErc721Approve.mockReturnValue({ config: {} } as any);
        mockUseErc721Approve.mockReturnValue({
            data: {},
            wait: vi.fn(),
        } as any);
        mockUsePrepareErc721PortalDepositErc721Token.mockReturnValue({
            config: {},
        } as any);
        mockUseErc721PortalDepositErc721Token.mockReturnValue({
            data: {},
            wait: vi.fn(),
        } as any);
        mockUseContractReads.mockReturnValue({
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
        mockUseAccount.mockReturnValue({
            address: "0x8FD78976f8955D13bAA4fC99043208F4EC020D7E",
        } as any);
        mockUseWaitForTransaction.mockReturnValue({} as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    describe("useTokensOfOwnerByIndex hook", () => {
        it('should return an empty list with token ids when "erc721ContractAddress" is undefined', () => {
            const [address] = defaultProps.applications;
            const { result } = renderHook(() =>
                useTokensOfOwnerByIndex(
                    undefined as unknown as Address,
                    address as Address,
                ),
            );

            expect(result.current.tokenIds.length).toBe(0);
        });

        it('should return an empty list with token ids when "ownerAddress" are undefined', () => {
            const [erc721ContractAddress] = contracts;
            const { result } = renderHook(() =>
                useTokensOfOwnerByIndex(
                    erc721ContractAddress as Address,
                    undefined as unknown as Address,
                ),
            );

            expect(result.current.tokenIds.length).toBe(0);
        });

        it("should return a list with one token id when data for token ids contain only one entry", () => {
            const [erc721ContractAddress] = contracts;
            const [address] = defaultProps.applications;

            mockUseContractReads.mockReturnValue({
                isLoading: false,
                isSuccess: true,
                data: [
                    {
                        result: 1n,
                        status: "success",
                    },
                ],
            } as any);

            const { result } = renderHook(() =>
                useTokensOfOwnerByIndex(
                    erc721ContractAddress as Address,
                    address as Address,
                ),
            );

            expect(result.current.tokenIds.length).toBe(1);
            expect(result.current.tokenIds[0]).toBe(1n);
        });

        it("should return a list with multiple token id when data for token ids contain multiple entries", () => {
            const [erc721ContractAddress] = contracts;
            const [address] = defaultProps.applications;
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
                return {
                    isLoading: false,
                    isSuccess: true,
                    data: [data[Number(contractData.args[1])]],
                };
            };
            mockUseContractReads.mockImplementation(implementation as any);

            const { result } = renderHook(() =>
                useTokensOfOwnerByIndex(
                    erc721ContractAddress as Address,
                    address as Address,
                ),
            );

            expect(result.current.tokenIds.length).toBe(data.length);

            data.forEach((entry, entryIndex) => {
                expect(entry.result).toBe(result.current.tokenIds[entryIndex]);
            });
        });

        it("should return an empty list when data for token ids contains no entries", () => {
            const [erc721ContractAddress] = contracts;
            const [address] = defaultProps.applications;

            mockUseContractReads.mockReturnValue({
                isLoading: false,
                isSuccess: true,
                data: [],
            } as any);

            const { result } = renderHook(() =>
                useTokensOfOwnerByIndex(
                    erc721ContractAddress as Address,
                    address as Address,
                ),
            );

            expect(result.current.tokenIds.length).toBe(0);
        });

        it("should return an empty list when 'tokenOfOwnerByIndex' is unavailable", () => {
            const [erc721ContractAddress] = contracts;
            const [address] = defaultProps.applications;

            mockUseContractReads.mockReturnValue({
                isLoading: false,
                isSuccess: true,
                data: [
                    {
                        result: undefined,
                        status: "failure",
                        error: {},
                    },
                ],
            } as any);

            const { result } = renderHook(() =>
                useTokensOfOwnerByIndex(
                    erc721ContractAddress as Address,
                    address as Address,
                ),
            );

            expect(result.current.tokenIds.length).toBe(0);
        });
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
            mockUseContractReads.mockImplementation(implementation as any);
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
            mockUseContractReads.mockImplementation(implementation as any);

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
            mockUseContractReads.mockImplementation(implementation as any);
            expect(screen.getByTestId("token-id-input")).toBeInTheDocument();
        });
    });
});
