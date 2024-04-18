import {
    useReadErc1155BalanceOf,
    useReadErc1155IsApprovedForAll,
    useReadErc1155SupportsInterface,
    useReadErc1155Uri,
    useSimulateErc1155BatchPortalDepositBatchErc1155Token,
    useSimulateErc1155SetApprovalForAll,
    useWriteErc1155BatchPortalDepositBatchErc1155Token,
    useWriteErc1155SetApprovalForAll,
} from "@cartesi/rollups-wagmi";
import {
    cleanup,
    fireEvent,
    getByText,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import * as viem from "viem";
import { afterEach, beforeEach, describe, it } from "vitest";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { ERC1155DepositForm } from "../../src";
import { ERC1155DepositFormProps } from "../../src/ERC1155DepositForm/types";
import { useGetTokenMetadata } from "../../src/ERC1155DepositForm/useGetTokenMetadata";
import withMantineTheme from "../utils/WithMantineTheme";
import {
    accountAddress,
    applicationIds,
    erc1155ContractIds,
    tokenMetadataResultStub,
} from "./stubs";

vi.mock("@cartesi/rollups-wagmi");
const useReadBalanceOfMock = vi.mocked(useReadErc1155BalanceOf, {
    partial: true,
});

const useReadIsApprovedForAllMock = vi.mocked(useReadErc1155IsApprovedForAll, {
    partial: true,
});

const useReadSupportsInterfaceMock = vi.mocked(
    useReadErc1155SupportsInterface,
    { partial: true },
);

const useReadUriMock = vi.mocked(useReadErc1155Uri, { partial: true });

const useSimulateSetApprovalForAllMock = vi.mocked(
    useSimulateErc1155SetApprovalForAll,
    { partial: true },
);
const useSimulatePortalDepositBatchMock = vi.mocked(
    useSimulateErc1155BatchPortalDepositBatchErc1155Token,
    { partial: true },
);
const useWriteSetApprovalForAllMock = vi.mocked(
    useWriteErc1155SetApprovalForAll,
    { partial: true },
);
const useWritePortalDepositBatchMock = vi.mocked(
    useWriteErc1155BatchPortalDepositBatchErc1155Token,
    { partial: true },
);

vi.mock("wagmi");
const useAccountMock = vi.mocked(useAccount, { partial: true });
const useWaitForTransactionReceiptMock = vi.mocked(
    useWaitForTransactionReceipt,
    { partial: true },
);

vi.mock("../../src/ERC1155DepositForm/useGetTokenMetadata");
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
    mode: "batch",
    applications: applicationIds,
    tokens: erc1155ContractIds,
    isLoadingApplications: false,
    onSearchApplications: vi.fn(),
    onSearchTokens: vi.fn(),
    onSuccess: vi.fn(),
};

const Component = withMantineTheme(ERC1155DepositForm);

const text = {
    DEPOSITS_FOR_REVIEW: "Deposits for review",
    ADD_TO_DEPOSIT_LIST_BUTTON: "ADD TO DEPOSIT LIST",
} as const;

const testid = {
    APPLICATION_INPUT: "application",
    TOKEN_ID_INPUT: "token-id-input",
    AMOUNT_INPUT: "amount-input",
    ERC_1155_ADDRESS_INPUT: "erc1155Address",
    EXEC_LAYER_DATA_INPUT: "execution-layer-data-input",
    BASE_LAYER_DATA_INPUT: "base-layer-data-input",
    METADATA_VIEW: "metadata-view",
    METADATA_VIEW_IMG: "metadata-view-img",
    BATCH_REVIEW_TABLE: "batch-review-table",
} as const;

type Screen = typeof screen;
const fillForm = (screen: Screen) => {
    fireEvent.change(screen.getByTestId(testid.APPLICATION_INPUT), {
        target: {
            value: applicationIds[0],
        },
    });

    fireEvent.change(screen.getByTestId(testid.ERC_1155_ADDRESS_INPUT), {
        target: {
            value: applicationIds[1],
        },
    });

    fireEvent.change(screen.getByTestId(testid.TOKEN_ID_INPUT), {
        target: { value: "0" },
    });

    fireEvent.change(screen.getByTestId(testid.AMOUNT_INPUT), {
        target: { value: "500" },
    });
};

describe("ERC-1155 Batch Deposit", () => {
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

        useSimulatePortalDepositBatchMock.mockReturnValue({
            isLoading: false,
            fetchStatus: "idle",
            data: { request: {} },
            error: null,
        });

        useWritePortalDepositBatchMock.mockReturnValue({
            isIdle: true,
            status: "idle",
            reset: () => {},
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
        expect(screen.getByText("ERC-1155")).toBeInTheDocument();
        expect(
            screen.getByText("The ERC-1155 smart contract address"),
        ).toBeInTheDocument();
    });

    it("should display fields for token id and amount after filling app address and contract address", async () => {
        render(<Component {...defaultProps} />);

        fireEvent.change(screen.getByTestId(testid.APPLICATION_INPUT), {
            target: {
                value: applicationIds[0],
            },
        });

        fireEvent.change(screen.getByTestId(testid.ERC_1155_ADDRESS_INPUT), {
            target: {
                value: applicationIds[0],
            },
        });

        fireEvent.click(screen.getByText("Advanced"));

        await waitFor(() => screen.getByText("Token id"));

        expect(
            screen.getByText("Token identifier to deposit"),
        ).toBeInTheDocument();

        expect(screen.getByLabelText("Amount *")).toBeInTheDocument();
        expect(
            screen.getByText("Amount of tokens to deposit"),
        ).toBeInTheDocument();

        expect(screen.getByText("ADD TO DEPOSIT LIST")).toBeVisible();
    });

    it("should display Base and Execution layer data fields after clicking the advanced button", async () => {
        render(<Component {...defaultProps} />);

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

    describe("Validations", () => {
        describe("Application field", () => {
            it("should display field required message", async () => {
                render(<Component {...defaultProps} />);

                const input = screen.getByTestId(testid.APPLICATION_INPUT);
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

                const input = screen.getByTestId(testid.APPLICATION_INPUT);

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
                render(<Component {...defaultProps} />);

                const input = screen.getByTestId(testid.ERC_1155_ADDRESS_INPUT);
                fireEvent.change(input, {
                    target: { value: applicationIds[0] },
                });

                fireEvent.change(input, { target: { value: "" } });

                expect(
                    await screen.findByText("ERC1155 address is required"),
                ).toBeInTheDocument();
            });

            it("should display invalid address message", async () => {
                render(<Component {...defaultProps} />);

                const input = screen.getByTestId(testid.ERC_1155_ADDRESS_INPUT);

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

                render(<Component {...defaultProps} />);

                const erc721Address =
                    "0x7a3cc9c0408887a030a0354330c36a9cd681aa7e";

                const input = screen.getByTestId("erc1155Address");
                fireEvent.change(input, {
                    target: {
                        value: erc721Address,
                    },
                });

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

                render(<Component {...defaultProps} />);

                const erc20Address =
                    "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8";

                const input = screen.getByTestId("erc1155Address");
                fireEvent.change(input, {
                    target: {
                        value: erc20Address,
                    },
                });

                expect(
                    await screen.findByText(
                        "This is not an ERC-1155 contract. Check the address.",
                    ),
                ).toBeInTheDocument();
            });
        });

        describe("Token id field", () => {
            it("should display field require message", async () => {
                render(<Component {...defaultProps} />);

                fireEvent.change(screen.getByTestId(testid.APPLICATION_INPUT), {
                    target: {
                        value: applicationIds[0],
                    },
                });

                fireEvent.change(
                    screen.getByTestId(testid.ERC_1155_ADDRESS_INPUT),
                    {
                        target: {
                            value: applicationIds[0],
                        },
                    },
                );

                const tokenIdInput = screen.getByTestId(testid.TOKEN_ID_INPUT);

                fireEvent.change(tokenIdInput, {
                    target: { value: "0" },
                });

                fireEvent.change(tokenIdInput, {
                    target: { value: "" },
                });

                expect(
                    await screen.findByText("Token id is required!"),
                ).toBeInTheDocument();
            });

            it("should display integer is required message", async () => {
                render(<Component {...defaultProps} />);

                fireEvent.change(screen.getByTestId(testid.APPLICATION_INPUT), {
                    target: {
                        value: applicationIds[0],
                    },
                });

                fireEvent.change(
                    screen.getByTestId(testid.ERC_1155_ADDRESS_INPUT),
                    {
                        target: {
                            value: applicationIds[0],
                        },
                    },
                );

                fireEvent.change(screen.getByTestId(testid.TOKEN_ID_INPUT), {
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
                render(<Component {...defaultProps} />);

                fireEvent.change(screen.getByTestId(testid.APPLICATION_INPUT), {
                    target: {
                        value: applicationIds[0],
                    },
                });

                fireEvent.change(
                    screen.getByTestId(testid.ERC_1155_ADDRESS_INPUT),
                    {
                        target: {
                            value: applicationIds[0],
                        },
                    },
                );

                fireEvent.change(screen.getByTestId(testid.TOKEN_ID_INPUT), {
                    target: { value: "0" },
                });

                fireEvent.change(screen.getByTestId(testid.AMOUNT_INPUT), {
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

                render(<Component {...defaultProps} />);

                fireEvent.change(screen.getByTestId(testid.APPLICATION_INPUT), {
                    target: {
                        value: applicationIds[0],
                    },
                });

                fireEvent.change(
                    screen.getByTestId(testid.ERC_1155_ADDRESS_INPUT),
                    {
                        target: {
                            value: applicationIds[0],
                        },
                    },
                );

                fireEvent.change(screen.getByTestId(testid.TOKEN_ID_INPUT), {
                    target: { value: "0" },
                });

                fireEvent.change(screen.getByTestId(testid.AMOUNT_INPUT), {
                    target: { value: "200" },
                });

                expect(
                    await screen.findByText(
                        "The amount should be smaller or equal to your balance.",
                    ),
                ).toBeInTheDocument();
            });

            it("should display error message when total sum for specified token is above the balance.", async () => {
                useReadBalanceOfMock.mockReturnValue({
                    isLoading: false,
                    data: 600n,
                });

                render(<Component {...defaultProps} />);
                fillForm(screen);

                fireEvent.click(
                    screen.getByText(text.ADD_TO_DEPOSIT_LIST_BUTTON),
                );

                await waitFor(() =>
                    expect(
                        screen.getByText(text.DEPOSITS_FOR_REVIEW),
                    ).toBeVisible(),
                );

                fireEvent.change(screen.getByTestId(testid.TOKEN_ID_INPUT), {
                    target: { value: "0" },
                });

                fireEvent.change(screen.getByTestId(testid.AMOUNT_INPUT), {
                    target: { value: "500" },
                });

                expect(
                    await screen.findByText(
                        "You are above your balance for token id 0. Delete an entry on review or change your amount.",
                    ),
                ).toBeVisible();
            });
        });

        describe("Data layer fields", () => {
            it("should display error message for invalid hex value for Base layer data", async () => {
                render(<Component {...defaultProps} />);

                fireEvent.click(screen.getByText("Advanced"));

                fireEvent.change(
                    screen.getByTestId(testid.BASE_LAYER_DATA_INPUT),
                    {
                        target: { value: "hello-world" },
                    },
                );
                expect(
                    await screen.findByText("Invalid hex string"),
                ).toBeInTheDocument();
            });

            it("should display error message for invalid hex value for Execution layer data", async () => {
                render(<Component {...defaultProps} />);

                fireEvent.click(screen.getByText("Advanced"));

                fireEvent.change(
                    screen.getByTestId(testid.EXEC_LAYER_DATA_INPUT),
                    {
                        target: { value: "hello-execution-layer" },
                    },
                );
                expect(
                    await screen.findByText("Invalid hex string"),
                ).toBeInTheDocument();
            });
        });

        describe("Batch list", () => {
            it("should display error message when removing all the items in the review list", async () => {
                render(<Component {...defaultProps} />);
                fillForm(screen);

                fireEvent.click(
                    screen.getByText(text.ADD_TO_DEPOSIT_LIST_BUTTON),
                );

                fireEvent.click(screen.getByText(text.DEPOSITS_FOR_REVIEW));

                await waitFor(() =>
                    expect(
                        screen.getByTestId(testid.BATCH_REVIEW_TABLE),
                    ).toBeVisible(),
                );

                const row = screen.getByRole("row", { name: "0 Gold 500" });

                expect(row).toBeVisible();

                fireEvent.click(within(row).getByRole("button"));

                expect(
                    await screen.findByText(
                        "At least one deposit should be added. Or consider using the single deposit version.",
                    ),
                ).toBeVisible();

                expect(
                    screen.getByTestId(testid.BATCH_REVIEW_TABLE),
                ).not.toBeVisible();
            });
        });
    });

    describe("Metadata View", () => {
        it("should display token metadata on request success", async () => {
            render(<Component {...defaultProps} />);

            fireEvent.change(screen.getByTestId(testid.APPLICATION_INPUT), {
                target: {
                    value: applicationIds[0],
                },
            });

            fireEvent.change(
                screen.getByTestId(testid.ERC_1155_ADDRESS_INPUT),
                {
                    target: {
                        value: applicationIds[0],
                    },
                },
            );

            fireEvent.change(screen.getByTestId(testid.TOKEN_ID_INPUT), {
                target: { value: "0" },
            });

            const metadataView = screen.getByTestId(testid.METADATA_VIEW);

            await waitFor(() => expect(metadataView).toBeVisible());

            expect(getByText(metadataView, "Gold")).toBeVisible();
            expect(
                getByText(metadataView, "Golden coins to use."),
            ).toBeInTheDocument();
            const img = screen
                .getByTestId(testid.METADATA_VIEW_IMG)
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

            render(<Component {...defaultProps} />);

            fireEvent.change(screen.getByTestId(testid.APPLICATION_INPUT), {
                target: {
                    value: applicationIds[0],
                },
            });

            fireEvent.change(
                screen.getByTestId(testid.ERC_1155_ADDRESS_INPUT),
                {
                    target: {
                        value: applicationIds[0],
                    },
                },
            );

            fireEvent.change(screen.getByTestId(testid.TOKEN_ID_INPUT), {
                target: { value: "0" },
            });

            expect(
                screen.queryByTestId(testid.METADATA_VIEW),
            ).not.toBeInTheDocument();

            expect(
                await screen.findByText(
                    "Something is wrong with the URI returned by the contract.",
                ),
            ).toBeVisible();

            expect(screen.getByText("URI is not defined.")).toBeVisible();
        });

        it("should display an info message when URI is valid but it is not a HTTP protocol", async () => {
            useGetTokenMetadataMock.mockReturnValue({
                isHttp: false,
                url: "ipfs://QmYN9HnMjYuZB173n7daXGLXuC41JnSHz4pXKzqMEUDGj7",
                state: "not_http",
            });

            render(<Component {...defaultProps} />);

            fireEvent.change(screen.getByTestId(testid.APPLICATION_INPUT), {
                target: {
                    value: applicationIds[0],
                },
            });

            fireEvent.change(
                screen.getByTestId(testid.ERC_1155_ADDRESS_INPUT),
                {
                    target: {
                        value: applicationIds[0],
                    },
                },
            );

            fireEvent.change(screen.getByTestId(testid.TOKEN_ID_INPUT), {
                target: { value: "0" },
            });

            expect(
                screen.queryByTestId(testid.METADATA_VIEW),
            ).not.toBeInTheDocument();

            expect(
                await screen.findByText(
                    "The URI is valid, but it is not an HTTP protocol.",
                ),
            ).toBeVisible();

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

            render(<Component {...defaultProps} />);

            fireEvent.change(screen.getByTestId(testid.APPLICATION_INPUT), {
                target: {
                    value: applicationIds[0],
                },
            });

            fireEvent.change(
                screen.getByTestId(testid.ERC_1155_ADDRESS_INPUT),
                {
                    target: {
                        value: applicationIds[0],
                    },
                },
            );

            fireEvent.change(screen.getByTestId(testid.TOKEN_ID_INPUT), {
                target: { value: "0" },
            });

            expect(
                screen.queryByTestId(testid.METADATA_VIEW),
            ).not.toBeInTheDocument();

            expect(
                await screen.findByText("We could not fetch the metadata."),
            ).toBeVisible();

            expect(
                screen.getByText(tokenMetadataResultStub.url!),
            ).toBeVisible();
        });
    });

    describe("Batch deposit review", () => {
        it("should display a table with items added to be deposited", async () => {
            render(<Component {...defaultProps} />);
            fillForm(screen);

            fireEvent.click(screen.getByText(text.ADD_TO_DEPOSIT_LIST_BUTTON));

            fireEvent.change(screen.getByTestId(testid.TOKEN_ID_INPUT), {
                target: { value: "1" },
            });

            fireEvent.change(screen.getByTestId(testid.AMOUNT_INPUT), {
                target: { value: "100" },
            });

            fireEvent.click(screen.getByText(text.ADD_TO_DEPOSIT_LIST_BUTTON));

            await waitFor(() =>
                expect(
                    screen.getByText(text.DEPOSITS_FOR_REVIEW),
                ).toBeVisible(),
            );

            fireEvent.click(screen.getByText(text.DEPOSITS_FOR_REVIEW));

            await waitFor(() =>
                expect(
                    screen.getByTestId(testid.BATCH_REVIEW_TABLE),
                ).toBeVisible(),
            );

            const reviewTable = screen.getByTestId(testid.BATCH_REVIEW_TABLE);

            expect(
                screen.getByRole("row", { name: "0 Gold 500" }),
            ).toBeVisible();
            expect(
                screen.getByRole("row", { name: "1 Gold 100" }),
            ).toBeVisible();

            expect(reviewTable.childElementCount).toEqual(2);
        });

        it("should be able to remove items from the review list", async () => {
            render(<Component {...defaultProps} />);
            fillForm(screen);

            fireEvent.click(screen.getByText(text.ADD_TO_DEPOSIT_LIST_BUTTON));

            fireEvent.change(screen.getByTestId(testid.TOKEN_ID_INPUT), {
                target: { value: "1" },
            });

            fireEvent.change(screen.getByTestId(testid.AMOUNT_INPUT), {
                target: { value: "100" },
            });

            fireEvent.click(screen.getByText(text.ADD_TO_DEPOSIT_LIST_BUTTON));

            fireEvent.click(screen.getByText(text.DEPOSITS_FOR_REVIEW));

            await waitFor(() =>
                expect(
                    screen.getByTestId(testid.BATCH_REVIEW_TABLE),
                ).toBeVisible(),
            );

            const rowToRemove = screen.getByRole("row", {
                name: "1 Gold 100",
            });

            expect(
                screen.getByRole("row", { name: "0 Gold 500" }),
            ).toBeVisible();
            expect(
                screen.getByRole("row", { name: "1 Gold 100" }),
            ).toBeVisible();

            fireEvent.click(within(rowToRemove).getByRole("button"));

            expect(
                screen
                    .getByTestId(testid.BATCH_REVIEW_TABLE)
                    .querySelector("tbody")?.childElementCount,
            ).toEqual(1);
        });
    });

    describe("Actions", () => {
        describe("Approve states", () => {
            it("should display approved when portal is set as an approved operator", () => {
                const writeContract = vi.fn();

                useWriteSetApprovalForAllMock.mockReturnValue({
                    writeContract: writeContract,
                });

                render(<Component {...defaultProps} />);
                fillForm(screen);

                const btn = screen.getByText("Approved").closest("button");
                fireEvent.click(btn!);

                expect(btn).toBeDisabled();
                expect(writeContract).toHaveBeenCalledTimes(0);
            });

            it("should be able to click the approve when portal is not authorized and at least one deposit on review", () => {
                useReadIsApprovedForAllMock.mockReturnValue({
                    isLoading: false,
                    data: false,
                });
                const writeContract = vi.fn();

                useWriteSetApprovalForAllMock.mockReturnValue({
                    writeContract: writeContract,
                });

                render(<Component {...defaultProps} />);
                fillForm(screen);
                fireEvent.click(
                    screen.getByText(text.ADD_TO_DEPOSIT_LIST_BUTTON),
                );

                const btn = screen.getByText("Approve");

                fireEvent.click(btn);

                expect(writeContract).toHaveBeenCalledTimes(1);
            });

            it("should display a feedback while waiting approve transaction confirmation", () => {
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

                render(<Component {...defaultProps} />);
                fillForm(screen);

                const btn = screen.getByText("Approve").closest("button");
                expect(btn?.getAttribute("data-loading")).toEqual("true");
                expect(
                    screen.getByText("Waiting for confirmation..."),
                ).toBeVisible();
            });

            it("should display a feedback once the approve transaction is confirmed", () => {
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

                render(<Component {...defaultProps} />);
                fillForm(screen);

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

            it("should display error message when transaction fails", () => {
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

                render(<Component {...defaultProps} />);
                fillForm(screen);
                fireEvent.click(
                    screen.getByText(text.ADD_TO_DEPOSIT_LIST_BUTTON),
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
            it("should keep deposit button disabled when portal is not an approved operator", () => {
                const writeContract = vi.fn();

                useWritePortalDepositBatchMock.mockReturnValue({
                    writeContract: writeContract,
                });

                useReadIsApprovedForAllMock.mockReturnValue({
                    isLoading: false,
                    data: false,
                });

                render(<Component {...defaultProps} />);
                fillForm(screen);

                const btn = screen.getByText("Deposit").closest("button");
                fireEvent.click(btn!);

                expect(btn).toBeDisabled();
                expect(writeContract).toHaveBeenCalledTimes(0);
            });

            it("should be able to click the deposit button when authorized and form is valid", () => {
                useReadIsApprovedForAllMock.mockReturnValue({
                    isLoading: false,
                    data: true,
                });
                const writeContract = vi.fn();

                useWritePortalDepositBatchMock.mockReturnValue({
                    writeContract: writeContract,
                    data: "0x0002",
                    status: "idle",
                });

                render(<Component {...defaultProps} />);
                fillForm(screen);

                fireEvent.click(
                    screen.getByText(text.ADD_TO_DEPOSIT_LIST_BUTTON),
                );

                const btn = screen.getByText("Deposit");

                fireEvent.click(btn);

                expect(writeContract).toHaveBeenCalledTimes(1);
            });

            it("should display a feedback while waiting deposit confirmation", () => {
                useWritePortalDepositBatchMock.mockReturnValue({
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

                render(<Component {...defaultProps} />);
                fillForm(screen);
                fireEvent.click(
                    screen.getByText(text.ADD_TO_DEPOSIT_LIST_BUTTON),
                );

                const btn = screen.getByText("Deposit").closest("button");
                expect(btn?.getAttribute("data-loading")).toEqual("true");
                expect(
                    screen.getByText("Waiting for confirmation..."),
                ).toBeVisible();
            });

            it("should cleanup and call onSuccess once the deposit is confirmed", () => {
                const depositReset = vi.fn();
                const approveReset = vi.fn();
                // Avoiding infinite loop by making a computed prop change when deposit reset is called.
                const depositWaitStatus = {
                    _status: "success",
                    get props(): {
                        status?: "success";
                        isSuccess?: true;
                    } {
                        return this._status === "success"
                            ? { status: "success", isSuccess: true }
                            : {};
                    },
                    reset() {
                        this._status = "idle";
                    },
                };

                useWriteSetApprovalForAllMock.mockReturnValue({
                    isIdle: true,
                    status: "idle",
                    reset: approveReset,
                });

                useWritePortalDepositBatchMock.mockReturnValue({
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

                render(<Component {...defaultProps} onSuccess={onSuccess} />);
                fillForm(screen);
                fireEvent.click(
                    screen.getByText(text.ADD_TO_DEPOSIT_LIST_BUTTON),
                );

                const btn = screen.getByText("Deposit").closest("button");

                expect(btn).toBeDisabled();
                expect(onSuccess).toHaveBeenCalledTimes(1);
                expect(depositReset).toHaveBeenCalledTimes(1);
                expect(approveReset).toHaveBeenCalledTimes(1);
            });

            it("should display error message when transaction fails", () => {
                useWritePortalDepositBatchMock.mockReturnValue({
                    isError: true,
                    status: "error",
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

                render(<Component {...defaultProps} />);
                fillForm(screen);
                fireEvent.click(
                    screen.getByText(text.ADD_TO_DEPOSIT_LIST_BUTTON),
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
