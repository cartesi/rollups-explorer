import {
    erc1155SinglePortalAbi,
    erc1155SinglePortalAddress,
    useReadErc1155BalanceOf,
    useReadErc1155IsApprovedForAll,
    useReadErc1155SupportsInterface,
    useReadErc1155Uri,
    useSimulateErc1155SetApprovalForAll,
    useWriteErc1155SetApprovalForAll,
    v2Erc1155SinglePortalAbi,
    v2Erc1155SinglePortalAddress,
} from "@cartesi/rollups-wagmi";
import {
    cleanup,
    fireEvent,
    getByText,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { isNotNilOrEmpty } from "ramda-adjunct";
import * as viem from "viem";
import { afterEach, beforeEach, describe, it } from "vitest";
import {
    useAccount,
    useSimulateContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import { ERC1155DepositForm } from "../../src";
import { useGetTokenMetadata } from "../../src/ERC1155DepositForm/hooks/useGetTokenMetadata";
import { ERC1155DepositFormProps } from "../../src/ERC1155DepositForm/types";
import { Application } from "../../src/commons/interfaces";
import withMantineTheme from "../utils/WithMantineTheme";
import { factoryWaitStatus } from "../utils/helpers";
import { applications } from "../utils/stubs";
import {
    accountAddress,
    applicationIds,
    erc1155ContractIds,
    tokenMetadataResultStub,
} from "./stubs";

vi.mock("@cartesi/rollups-wagmi");

const useReadSupportsInterfaceMock = vi.mocked(
    useReadErc1155SupportsInterface,
    { partial: true },
);

const useReadBalanceOfMock = vi.mocked(useReadErc1155BalanceOf, {
    partial: true,
});

const useReadIsApprovedForAllMock = vi.mocked(useReadErc1155IsApprovedForAll, {
    partial: true,
});

const useReadUriMock = vi.mocked(useReadErc1155Uri, { partial: true });

const useSimulateSetApprovalForAllMock = vi.mocked(
    useSimulateErc1155SetApprovalForAll,
    { partial: true },
);

const useWriteSetApprovalForAllMock = vi.mocked(
    useWriteErc1155SetApprovalForAll,
    { partial: true },
);

vi.mock("wagmi");
const useAccountMock = vi.mocked(useAccount, { partial: true });
const useSimulateContractMock = vi.mocked(useSimulateContract, {
    partial: true,
});
const useWriteContractMock = vi.mocked(useWriteContract, {
    partial: true,
});
const useWaitForTransactionReceiptMock = vi.mocked(
    useWaitForTransactionReceipt,
    { partial: true },
);

vi.mock("../../src/ERC1155DepositForm/hooks/useGetTokenMetadata");
const useGetTokenMetadataMock = vi.mocked(useGetTokenMetadata, {
    partial: true,
});

vi.mock("viem", async () => {
    const actual = await vi.importActual<typeof viem>("viem");
    return {
        ...actual,
        getAddress: (address: string) => address,
    };
});

vi.mock("../../src/hooks/useWatchQueryOnBlockChange", () => ({
    default: () => undefined,
}));

const defaultProps: ERC1155DepositFormProps = {
    mode: "single",
    applications: applications,
    tokens: erc1155ContractIds,
    isLoadingApplications: false,
    onSearchApplications: vi.fn(),
    onSearchTokens: vi.fn(),
    onSuccess: vi.fn(),
};

const Component = withMantineTheme(ERC1155DepositForm);

const fillFormValues = async (
    app: Application,
    address: string,
    tokenId?: string,
    amount?: string,
) => {
    const appInput = screen.getByTestId("application");

    fireEvent.change(appInput, {
        target: {
            value: app.address.toLowerCase(),
        },
    });

    await waitFor(() => expect(screen.getByText("ERC-1155")).toBeVisible());

    fireEvent.change(screen.getByTestId("erc1155Address"), {
        target: { value: address },
    });

    if (isNotNilOrEmpty(tokenId)) {
        fireEvent.change(screen.getByTestId("token-id-input"), {
            target: { value: tokenId },
        });
    }

    if (isNotNilOrEmpty(amount)) {
        fireEvent.change(screen.getByTestId("amount-input"), {
            target: { value: amount },
        });
    }
};

describe("ERC-1155 Single Deposit", () => {
    const foundApp = applications[0];
    beforeEach(() => {
        useReadSupportsInterfaceMock.mockReturnValue({
            isLoading: false,
            fetchStatus: "idle",
            data: true,
        });

        useReadBalanceOfMock.mockReturnValue({
            isLoading: false,
            data: 1000n,
        });

        useReadIsApprovedForAllMock.mockReturnValue({
            isLoading: false,
            data: true,
        });

        useReadUriMock.mockReturnValue({
            isLoading: false,
            data: undefined,
        });

        useSimulateSetApprovalForAllMock.mockReturnValue({
            isPending: false,
            isLoading: false,
            fetchStatus: "idle",
            data: { request: {} },
            error: null,
        });

        useWriteSetApprovalForAllMock.mockReturnValue({
            isIdle: true,
            status: "idle",
            reset: () => {},
        });

        useSimulateContractMock.mockReturnValue({
            data: undefined,
            status: "success",
            isLoading: false,
            isFetching: false,
            isSuccess: true,
            error: null,
        });

        useWriteContractMock.mockReturnValue({
            data: undefined,
            status: "idle",
            writeContract: vi.fn(),
            reset: vi.fn(),
        });

        useAccountMock.mockReturnValue({
            address: accountAddress,
        });

        useWaitForTransactionReceiptMock.mockReturnValue({
            status: "pending",
            fetchStatus: "idle",
        });

        useGetTokenMetadataMock.mockReturnValue(tokenMetadataResultStub);
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display expected initial fields", () => {
        render(<Component {...defaultProps} />);

        expect(screen.getByText("Application")).toBeInTheDocument();
        expect(
            screen.getByText("The application smart contract address"),
        ).toBeInTheDocument();
        expect(screen.queryByText("ERC-1155")).not.toBeInTheDocument();
        expect(
            screen.queryByText("The ERC-1155 smart contract address"),
        ).not.toBeInTheDocument();
    });

    it("should display fields for token id and amount after filling app address and contract address", async () => {
        render(<Component {...defaultProps} applications={[foundApp]} />);

        await fillFormValues(foundApp, erc1155ContractIds[0]);

        fireEvent.click(screen.getByText("Advanced"));

        await waitFor(() => screen.getByText("Token id"));

        expect(
            screen.getByText("Token identifier to deposit"),
        ).toBeInTheDocument();
        expect(screen.getByText("Amount")).toBeInTheDocument();
        expect(
            screen.getByText("Amount of tokens to deposit"),
        ).toBeInTheDocument();
    });

    it("should display Base and Execution layer data fields after clicking the advanced button", async () => {
        render(<Component {...defaultProps} applications={[foundApp]} />);

        await fillFormValues(foundApp, erc1155ContractIds[0]);

        fireEvent.click(screen.getByText("Advanced"));

        await waitFor(() => screen.getByText("Base layer data"));

        expect(
            screen.getByText(
                "Additional data to be interpreted by the base layer",
            ),
        );
        expect(screen.getByText("Execution layer data")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Additional data to be interpreted by the execution layer",
            ),
        );
    });

    describe("Warnings", () => {
        it("should display warning for undeployed Application address", async () => {
            render(<Component {...defaultProps} applications={[]} />);

            fireEvent.change(screen.getByTestId("application"), {
                target: { value: "0x60a7048c3136293071605a4eaffef49923e981fe" },
            });

            await waitFor(() =>
                expect(
                    screen.getByText(
                        "This is a deposit to an undeployed application.",
                    ),
                ).toBeVisible(),
            );
        });
    });

    describe("When the application is undeployed", () => {
        it("should display rollup-version options to be chosen", async () => {
            render(<Component {...defaultProps} applications={[]} />);

            fireEvent.change(screen.getByTestId("application"), {
                target: { value: applications[0].address },
            });

            await waitFor(() =>
                expect(
                    screen.getByText(
                        "This is a deposit to an undeployed application.",
                    ),
                ).toBeVisible(),
            );

            expect(screen.getByText("Cartesi Rollups version")).toBeVisible();
            expect(
                screen.getByText(
                    "Set the rollup version to call the correct contracts.",
                ),
            ).toBeVisible();

            expect(screen.queryByText("ERC-1155")).not.toBeInTheDocument();
            expect(screen.queryByText("Token id")).not.toBeInTheDocument();
            expect(screen.queryByText("Amount")).not.toBeInTheDocument();
            expect(screen.queryByText("Advanced")).not.toBeInTheDocument();
            expect(screen.queryByText("Approve")).not.toBeInTheDocument();
            expect(screen.queryByText("Deposit")).not.toBeInTheDocument();
        });

        it("should display the rest of the fields after choosing the Rollup version", async () => {
            render(<Component {...defaultProps} applications={[]} />);

            fireEvent.change(screen.getByTestId("application"), {
                target: { value: applications[0].address },
            });

            await waitFor(() =>
                expect(
                    screen.getByText(
                        "This is a deposit to an undeployed application.",
                    ),
                ).toBeVisible(),
            );

            const options = screen.getByRole("radiogroup");

            fireEvent.click(getByText(options, "Rollup v1"));

            await waitFor(() =>
                expect(screen.getByText("ERC-1155")).toBeVisible(),
            );

            fireEvent.change(screen.getByTestId("erc1155Address"), {
                target: { value: erc1155ContractIds[0] },
            });

            await waitFor(() =>
                expect(screen.getByText("Token id")).toBeVisible(),
            );

            expect(screen.getByText("Amount")).toBeVisible();
            expect(screen.getByText("Advanced")).toBeVisible();
            expect(screen.getByText("Approved")).toBeVisible();
            expect(screen.getByText("Deposit")).toBeVisible();
        });

        it("should setup correct contract configs when rollup version is chosen", async () => {
            render(<Component {...defaultProps} applications={[]} />);

            fireEvent.change(screen.getByTestId("application"), {
                target: { value: applications[0].address },
            });

            await waitFor(() =>
                expect(
                    screen.getByText(
                        "This is a deposit to an undeployed application.",
                    ),
                ).toBeVisible(),
            );

            const options = screen.getByRole("radiogroup");

            fireEvent.click(getByText(options, "Rollup v1"));

            const paramsForV1 =
                useSimulateContractMock.mock.lastCall?.[0] ?? {};

            expect(paramsForV1).toHaveProperty("abi", erc1155SinglePortalAbi);
            expect(paramsForV1).toHaveProperty(
                "address",
                erc1155SinglePortalAddress,
            );

            fireEvent.click(getByText(options, "Rollup v2"));

            const paramsForV2 =
                useSimulateContractMock.mock.lastCall?.[0] ?? {};

            expect(paramsForV2).toHaveProperty("abi", v2Erc1155SinglePortalAbi);
            expect(paramsForV2).toHaveProperty(
                "address",
                v2Erc1155SinglePortalAddress,
            );
        });
    });

    describe("Validations", () => {
        describe("Application field", () => {
            it("should display field required message", async () => {
                render(<Component {...defaultProps} />);

                const input = screen.getByTestId("application");
                fireEvent.change(input, {
                    target: { value: applicationIds[0] },
                });

                fireEvent.change(input, { target: { value: "" } });

                expect(
                    await screen.findByText("Application address is required."),
                ).toBeInTheDocument();
            });

            it("should display invalid address message", async () => {
                render(<Component {...defaultProps} />);

                const input = screen.getByTestId("application");

                fireEvent.change(input, {
                    target: { value: "invalid-address-here" },
                });

                expect(
                    await screen.findByText("Invalid Application address"),
                ).toBeInTheDocument();
            });
        });

        describe("ERC-1155 field", () => {
            it("should display field required message", async () => {
                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(foundApp, erc1155ContractIds[0]);

                const input = screen.getByTestId("erc1155Address");

                fireEvent.change(input, { target: { value: "" } });

                expect(
                    await screen.findByText("ERC1155 address is required"),
                ).toBeInTheDocument();
            });

            it("should display invalid address message", async () => {
                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(foundApp, erc1155ContractIds[0]);

                const input = screen.getByTestId("erc1155Address");

                fireEvent.change(input, {
                    target: { value: "invalid-text" },
                });

                expect(
                    await screen.findByText("Invalid ERC1155 address"),
                ).toBeInTheDocument();
            });

            it("should display invalid contract message when supported-interface call result is false", async () => {
                useReadSupportsInterfaceMock.mockReturnValue({
                    isLoading: false,
                    status: "success",
                    data: false,
                });

                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                const erc721Address =
                    "0x7a3cc9c0408887a030a0354330c36a9cd681aa7e";

                await fillFormValues(foundApp, erc721Address);

                expect(
                    await screen.findByText(
                        "This is not an ERC-1155 contract. Check the address.",
                    ),
                ).toBeInTheDocument();
            });

            it("should display invalid contract message when supported-interface call failed", async () => {
                useReadSupportsInterfaceMock.mockReturnValue({
                    isLoading: false,
                    status: "error",
                    data: undefined,
                });

                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                const erc20Address =
                    "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8";

                await fillFormValues(foundApp, erc20Address);

                expect(
                    await screen.findByText(
                        "This is not an ERC-1155 contract. Check the address.",
                    ),
                ).toBeInTheDocument();
            });
        });

        describe("Token id field", () => {
            it("should display field require message", async () => {
                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(foundApp, erc1155ContractIds[0]);

                fireEvent.change(screen.getByTestId("token-id-input"), {
                    target: { value: "0" },
                });

                fireEvent.change(screen.getByTestId("token-id-input"), {
                    target: { value: "" },
                });

                expect(
                    await screen.findByText("Token id is required!"),
                ).toBeInTheDocument();
            });

            it("should display integer is required message", async () => {
                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(foundApp, erc1155ContractIds[0]);

                fireEvent.change(screen.getByTestId("token-id-input"), {
                    target: { value: "0.01" },
                });

                expect(
                    await screen.findByText(
                        "Token id should be an integer value!",
                    ),
                ).toBeInTheDocument();
            });
        });

        describe("Amount field", () => {
            it("should display error message for invalid value", async () => {
                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(foundApp, erc1155ContractIds[0]);

                fireEvent.change(screen.getByTestId("token-id-input"), {
                    target: { value: "0" },
                });

                fireEvent.change(screen.getByTestId("amount-input"), {
                    target: { value: "0" },
                });

                expect(
                    await screen.findByText("Invalid amount."),
                ).toBeInTheDocument();
            });

            it("should display error message for amount bigger than the balance", async () => {
                useReadBalanceOfMock.mockReturnValue({
                    isLoading: false,
                    data: 100n,
                });

                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(foundApp, erc1155ContractIds[0]);

                fireEvent.change(screen.getByTestId("token-id-input"), {
                    target: { value: "0" },
                });

                fireEvent.change(screen.getByTestId("amount-input"), {
                    target: { value: "200" },
                });

                expect(
                    await screen.findByText(
                        "The amount should be smaller or equal to your balance.",
                    ),
                ).toBeInTheDocument();
            });
        });

        describe("Data layer fields", () => {
            it("should display error message for invalid hex value for Base layer data", async () => {
                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(foundApp, erc1155ContractIds[0]);

                fireEvent.click(screen.getByText("Advanced"));

                fireEvent.change(screen.getByTestId("base-layer-data-input"), {
                    target: { value: "hello-world" },
                });
                expect(
                    await screen.findByText("Invalid hex string"),
                ).toBeInTheDocument();
            });

            it("should display error message for invalid hex value for Execution layer data", async () => {
                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(foundApp, erc1155ContractIds[0]);

                fireEvent.click(screen.getByText("Advanced"));

                fireEvent.change(
                    screen.getByTestId("execution-layer-data-input"),
                    {
                        target: { value: "hello-execution-layer" },
                    },
                );
                expect(
                    await screen.findByText("Invalid hex string"),
                ).toBeInTheDocument();
            });
        });
    });

    describe("Metadata View", () => {
        it("should display token metadata on request success", async () => {
            render(<Component {...defaultProps} applications={[foundApp]} />);

            await fillFormValues(foundApp, erc1155ContractIds[0]);

            fireEvent.change(screen.getByTestId("token-id-input"), {
                target: { value: "0" },
            });

            const metadataView = screen.getByTestId("metadata-view");

            await waitFor(() => expect(metadataView).toBeVisible());

            expect(getByText(metadataView, "Gold")).toBeVisible();
            expect(
                getByText(metadataView, "Golden coins to use."),
            ).toBeInTheDocument();
            const img = screen
                .getByTestId("metadata-view-img")
                .querySelector("img");

            expect(img).toBeVisible();
            expect(img?.getAttribute("src")).toEqual(
                tokenMetadataResultStub.data?.image,
            );
        });

        it("should display an info message when URI has problems", async () => {
            useGetTokenMetadataMock.mockReturnValue({
                isHttp: false,
                url: "",
                state: "errored",
                error: new Error("Invalid URL"),
            });

            render(<Component {...defaultProps} applications={[foundApp]} />);

            await fillFormValues(foundApp, erc1155ContractIds[0]);

            fireEvent.change(screen.getByTestId("token-id-input"), {
                target: { value: "0" },
            });

            expect(
                screen.queryByTestId("metadata-view"),
            ).not.toBeInTheDocument();

            await waitFor(() =>
                expect(
                    screen.getByText(
                        "Something is wrong with the URI returned by the contract.",
                    ),
                ).toBeVisible(),
            );

            expect(screen.getByText("URI is not defined.")).toBeVisible();
        });

        it("should display an info message when URI is valid but it is not a HTTP protocol", async () => {
            useGetTokenMetadataMock.mockReturnValue({
                isHttp: false,
                url: "ipfs://QmYN9HnMjYuZB173n7daXGLXuC41JnSHz4pXKzqMEUDGj7",
                state: "not_http",
            });

            render(<Component {...defaultProps} applications={[foundApp]} />);

            await fillFormValues(foundApp, erc1155ContractIds[0], "0");

            expect(
                screen.queryByTestId("metadata-view"),
            ).not.toBeInTheDocument();

            await waitFor(() =>
                expect(
                    screen.getByText(
                        "The URI is valid, but it is not an HTTP protocol.",
                    ),
                ).toBeVisible(),
            );

            expect(
                screen.getByText(
                    "ipfs://QmYN9HnMjYuZB173n7daXGLXuC41JnSHz4pXKzqMEUDGj7",
                ),
            ).toBeVisible();
        });

        it("should display an info message when URI is valid but the request failed", async () => {
            useGetTokenMetadataMock.mockReturnValue({
                state: "http_network_error",
                error: new Error("403 forbidden"),
                data: undefined,
                isHttp: true,
                url: tokenMetadataResultStub.url,
            });

            render(<Component {...defaultProps} applications={[foundApp]} />);

            await fillFormValues(foundApp, erc1155ContractIds[0], "0");

            expect(
                screen.queryByTestId("metadata-view"),
            ).not.toBeInTheDocument();

            await waitFor(() =>
                expect(
                    screen.getByText("We could not fetch the metadata."),
                ).toBeVisible(),
            );

            expect(
                screen.getByText(tokenMetadataResultStub.url!),
            ).toBeVisible();
        });
    });

    describe("Actions", () => {
        describe("Approve states", () => {
            it("should display approved when portal is set as an approved operator", async () => {
                const writeContract = vi.fn();

                useWriteSetApprovalForAllMock.mockReturnValue({
                    writeContract: writeContract,
                });

                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(
                    foundApp,
                    erc1155ContractIds[0],
                    "0",
                    "500",
                );

                const btn = screen.getByText("Approved").closest("button");
                fireEvent.click(btn!);

                expect(btn).toBeDisabled();
                expect(writeContract).toHaveBeenCalledTimes(0);
            });

            it("should be able to click the approve when portal is not authorized", async () => {
                useReadIsApprovedForAllMock.mockReturnValue({
                    isLoading: false,
                    data: false,
                });
                const writeContract = vi.fn();

                useWriteSetApprovalForAllMock.mockReturnValue({
                    writeContract: writeContract,
                });

                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(
                    foundApp,
                    erc1155ContractIds[0],
                    "0",
                    "500",
                );

                const btn = screen.getByText("Approve");

                fireEvent.click(btn);

                expect(writeContract).toHaveBeenCalledTimes(1);
            });

            it("should display a feedback while waiting approve transaction confirmation", async () => {
                useReadIsApprovedForAllMock.mockReturnValue({
                    isLoading: false,
                    data: false,
                });

                useWriteSetApprovalForAllMock.mockReturnValue({
                    isIdle: false,
                    status: "pending",
                    data: "0x0001",
                });

                useWaitForTransactionReceiptMock.mockImplementation(
                    (params) => {
                        return params?.hash === "0x0001"
                            ? {
                                  isLoading: true,
                                  status: "pending",
                                  fetchStatus: "fetching",
                              }
                            : {
                                  isLoading: false,
                                  status: "pending",
                                  fetchStatus: "idle",
                              };
                    },
                );

                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(
                    foundApp,
                    erc1155ContractIds[0],
                    "0",
                    "500",
                );

                const btn = screen.getByText("Approve").closest("button");
                expect(btn?.getAttribute("data-loading")).toEqual("true");
                expect(
                    screen.getByText("Waiting for confirmation..."),
                ).toBeVisible();
            });

            it("should display a feedback once the approve transaction is confirmed", async () => {
                useReadIsApprovedForAllMock.mockReturnValue({
                    isLoading: false,
                    data: true,
                });

                useWriteSetApprovalForAllMock.mockReturnValue({
                    status: "success",
                    data: "0x0001",
                });

                useWaitForTransactionReceiptMock.mockImplementation(
                    (params) => {
                        return params?.hash === "0x0001"
                            ? {
                                  status: "success",
                                  isSuccess: true,
                                  fetchStatus: "idle",
                              }
                            : {
                                  fetchStatus: "idle",
                              };
                    },
                );

                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(
                    foundApp,
                    erc1155ContractIds[0],
                    "0",
                    "500",
                );

                const btn = screen.getByText("Approved").closest("button");
                expect(btn).toBeDisabled();

                expect(
                    screen.getByText("Approve transaction confirmed"),
                ).toBeVisible();

                expect(
                    screen.queryByText("Check wallet..."),
                ).not.toBeInTheDocument();

                expect(
                    screen.queryByText("Waiting for confirmation..."),
                ).not.toBeInTheDocument();
            });

            it("should display error message when transaction fails", async () => {
                useReadIsApprovedForAllMock.mockReturnValue({
                    isLoading: false,
                    data: false,
                });

                useWriteSetApprovalForAllMock.mockReturnValue({
                    status: "idle",
                    data: "0x0001",
                });

                useWaitForTransactionReceiptMock.mockImplementation(
                    (params) => {
                        return params?.hash === "0x0001"
                            ? {
                                  status: "error",
                                  isError: true,
                                  error: {
                                      shortMessage: "Something went wrong",
                                      code: 500,
                                      details: "Error",
                                      message: "Body error message",
                                      name: "Error",
                                      version: 1,
                                  },
                                  fetchStatus: "idle",
                              }
                            : {
                                  fetchStatus: "idle",
                              };
                    },
                );

                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(
                    foundApp,
                    erc1155ContractIds[0],
                    "0",
                    "500",
                );

                const btn = screen.getByText("Approve").closest("button");
                expect(btn).not.toBeDisabled();

                expect(screen.getByText("Something went wrong")).toBeVisible();
                expect(
                    screen.queryByText("Check wallet..."),
                ).not.toBeInTheDocument();

                expect(
                    screen.queryByText("Waiting for confirmation..."),
                ).not.toBeInTheDocument();
            });
        });

        describe("Deposit states", () => {
            beforeEach(() => {
                useSimulateContractMock.mockReturnValue({
                    status: "success",
                    isLoading: false,
                    isFetching: false,
                    isSuccess: true,
                    error: null,
                    data: {
                        request: {},
                    },
                });
            });

            it("should keep deposit button disabled when portal is not an approved operator", async () => {
                const writeContract = vi.fn();

                useWriteContractMock.mockReturnValue({
                    writeContract: writeContract,
                });

                useReadIsApprovedForAllMock.mockReturnValue({
                    isLoading: false,
                    data: false,
                });

                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(
                    foundApp,
                    erc1155ContractIds[0],
                    "0",
                    "500",
                );

                const btn = screen.getByText("Deposit").closest("button");
                fireEvent.click(btn!);

                expect(btn).toBeDisabled();
                expect(writeContract).toHaveBeenCalledTimes(0);
            });

            it("should be able to click the deposit button when authorized and form is valid", async () => {
                useReadIsApprovedForAllMock.mockReturnValue({
                    isLoading: false,
                    data: true,
                });

                const writeContract = vi.fn();

                useWriteContractMock.mockReturnValue({
                    writeContract: writeContract,
                    status: "success",
                    isPending: false,
                    data: "0x0002",
                });

                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(
                    foundApp,
                    erc1155ContractIds[0],
                    "0",
                    "500",
                );

                const btn = screen.getByText("Deposit");

                fireEvent.click(btn);

                expect(writeContract).toHaveBeenCalledTimes(1);
            });

            it("should display a feedback while waiting deposit confirmation", async () => {
                useWriteContractMock.mockReturnValue({
                    isIdle: false,
                    status: "success",
                    data: "0x0001",
                });

                useWaitForTransactionReceiptMock.mockImplementation(
                    (params) => {
                        return params?.hash === "0x0001"
                            ? {
                                  isLoading: true,
                                  status: "pending",
                                  fetchStatus: "fetching",
                              }
                            : {
                                  isLoading: false,
                                  status: "pending",
                                  fetchStatus: "idle",
                              };
                    },
                );

                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(
                    foundApp,
                    erc1155ContractIds[0],
                    "0",
                    "500",
                );

                const btn = screen.getByText("Deposit").closest("button");
                expect(btn?.getAttribute("data-loading")).toEqual("true");
                expect(
                    screen.getByText("Waiting for confirmation..."),
                ).toBeVisible();
            });

            it("should cleanup and call onSuccess once the deposit is confirmed", async () => {
                const depositReset = vi.fn();
                const approveReset = vi.fn();

                // Avoiding infinite loop by making a computed prop change when deposit reset is called.
                const depositWaitStatus = factoryWaitStatus();

                useWriteSetApprovalForAllMock.mockReturnValue({
                    isIdle: true,
                    status: "idle",
                    reset: approveReset,
                });

                useWriteContractMock.mockReturnValue({
                    status: "success",
                    data: "0x0001",
                    reset: () => {
                        depositReset();
                        depositWaitStatus.reset();
                    },
                });

                useWaitForTransactionReceiptMock.mockImplementation(
                    (params) => {
                        return params?.hash === "0x0001"
                            ? {
                                  ...depositWaitStatus.props,
                                  fetchStatus: "idle",
                                  data: { transactionHash: "0x01" },
                              }
                            : {
                                  fetchStatus: "idle",
                              };
                    },
                );

                const onSuccess = vi.fn();
                const onSearchTokens = vi.fn();
                const onSearchApplication = vi.fn();

                const { rerender } = render(
                    <Component
                        {...defaultProps}
                        onSuccess={onSuccess}
                        applications={[foundApp]}
                        onSearchApplications={onSearchApplication}
                        onSearchTokens={onSearchTokens}
                    />,
                );

                await fillFormValues(
                    foundApp,
                    erc1155ContractIds[0],
                    "0",
                    "500",
                );

                const btn = screen.getByText("Deposit").closest("button");

                expect(btn).toBeDisabled();
                expect(onSuccess).toHaveBeenCalledWith({
                    receipt: { transactionHash: "0x01" },
                    type: "ERC-1155",
                });
                expect(onSearchApplication).toHaveBeenCalledWith("");
                expect(onSearchTokens).toHaveBeenCalledWith("");
                expect(depositReset).toHaveBeenCalledTimes(1);
                expect(approveReset).toHaveBeenCalledTimes(1);

                rerender(
                    <Component
                        {...defaultProps}
                        onSuccess={onSuccess}
                        applications={applications}
                        onSearchApplications={onSearchApplication}
                        onSearchTokens={onSearchTokens}
                    />,
                );

                await waitFor(() =>
                    expect(
                        screen.queryByText("ERC-1155"),
                    ).not.toBeInTheDocument(),
                );

                expect(screen.queryByText("Token id")).not.toBeInTheDocument();
                expect(screen.queryByText("Amount")).not.toBeInTheDocument();
                expect(screen.queryByText("Advanced")).not.toBeInTheDocument();
                expect(screen.queryByText("Approve")).not.toBeInTheDocument();
                expect(screen.queryByText("Deposit")).not.toBeInTheDocument();
            });

            it("should display error message when transaction fails", async () => {
                useWriteContractMock.mockReturnValue({
                    isIdle: false,
                    isPending: false,
                    isSuccess: true,
                    status: "success",
                    data: "0x0001",
                });

                useWaitForTransactionReceiptMock.mockImplementation(
                    (params) => {
                        return params?.hash === "0x0001"
                            ? {
                                  status: "error",
                                  isError: true,
                                  error: {
                                      shortMessage: "Transaction reverted!",
                                      code: 500,
                                      details: "Error",
                                      message: "error message",
                                      name: "Error",
                                      version: 1,
                                  },
                                  fetchStatus: "idle",
                              }
                            : {
                                  fetchStatus: "idle",
                              };
                    },
                );

                render(
                    <Component {...defaultProps} applications={[foundApp]} />,
                );

                await fillFormValues(
                    foundApp,
                    erc1155ContractIds[0],
                    "0",
                    "500",
                );

                const btn = screen.getByText("Deposit").closest("button");
                expect(btn).not.toBeDisabled();

                expect(screen.getByText("Transaction reverted!")).toBeVisible();
                expect(
                    screen.queryByText("Check wallet..."),
                ).not.toBeInTheDocument();

                expect(
                    screen.queryByText("Waiting for confirmation..."),
                ).not.toBeInTheDocument();
            });
        });
    });
});
