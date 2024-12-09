import {
    erc721PortalAbi,
    erc721PortalAddress,
    useSimulateErc721Approve,
    useWriteErc721Approve,
    v2Erc721PortalAbi,
    v2Erc721PortalAddress,
} from "@cartesi/rollups-wagmi";
import {
    fireEvent,
    getByText,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { isNotNilOrEmpty } from "ramda-adjunct";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import {
    useReadContracts,
    useSimulateContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import { ERC721DepositForm } from "../../src";
import { Application } from "../../src/commons/interfaces";
import useTokensOfOwnerByIndex from "../../src/hooks/useTokensOfOwnerByIndex";
import withMantineTheme from "../utils/WithMantineTheme";
import { factoryWaitStatus } from "../utils/helpers";
import { applications, erc721Contracts } from "../utils/stubs";

const Component = withMantineTheme(ERC721DepositForm);

const defaultProps = {
    applications: applications,
    isLoadingApplications: false,
    onSearchApplications: () => undefined,
    onSuccess: () => undefined,
};

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return {
        ...actual,
        useSimulateContract: vi.fn(),
        useWriteContract: vi.fn(),
        useWaitForTransactionReceipt: vi.fn(),
        useReadContracts: vi.fn(),
        useAccount: () => ({
            address: "0x8FD78976f8955D13bAA4fC99043208F4EC020D7E",
        }),
    };
});

vi.mock("../../src/hooks/useWatchQueryOnBlockChange", () => ({
    default: vi.fn(),
}));

vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...actual,
        getAddress: (address: string) => address,
    };
});

vi.mock("../../src/hooks/useTokensOfOwnerByIndex", () => ({
    default: vi.fn(),
}));

vi.mock("@cartesi/rollups-wagmi", async () => {
    const actual = await vi.importActual("@cartesi/rollups-wagmi");
    return {
        ...actual,
        useSimulateErc721Approve: vi.fn(),
        useWriteErc721Approve: vi.fn(),
    };
});

const useSimulateContractMock = vi.mocked(useSimulateContract, {
    partial: true,
});
const useSimulateErc721ApproveMock = vi.mocked(useSimulateErc721Approve, {
    partial: true,
});
const useWriteErc721ApproveMock = vi.mocked(useWriteErc721Approve, {
    partial: true,
});
const useReadContractsMock = vi.mocked(useReadContracts, { partial: true });
const useWriteContractMock = vi.mocked(useWriteContract, { partial: true });
const useWaitForTransactionReceiptMock = vi.mocked(
    useWaitForTransactionReceipt,
    { partial: true },
);

const useTokensOfOwnerByIndexMock = vi.mocked(useTokensOfOwnerByIndex, {
    partial: true,
});

const fillFormValues = async (
    app: Application,
    address: string,
    tokenId?: string,
) => {
    const appInput = screen.getByTestId("application");

    fireEvent.change(appInput, {
        target: {
            value: app.address.toLowerCase(),
        },
    });

    await waitFor(() => expect(screen.getByText("ERC-721")).toBeVisible());

    fireEvent.change(screen.getByTestId("erc721Address"), {
        target: { value: address },
    });

    if (isNotNilOrEmpty(tokenId)) {
        fireEvent.change(screen.getByTestId("token-id-input"), {
            target: { value: tokenId },
        });
    }
};

const cast = (obj: any, func: any) => obj as ReturnType<typeof func>;

describe("ERC721 Portal Deposit Form", () => {
    const defaultReturnForWriteFn = {
        data: undefined,
        status: "idle",
        writeContract: vi.fn(),
        reset: vi.fn(),
    };

    const defaultReturnForSimulateFn = {
        data: undefined,
        status: "success",
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        error: null,
    };

    beforeEach(() => {
        // Default returns as the erc-721 address does not implement enumerable interface
        useTokensOfOwnerByIndexMock.mockReturnValue({
            fetching: false,
            tokenIds: [],
        });

        useSimulateErc721ApproveMock.mockReturnValue({
            ...cast(defaultReturnForSimulateFn, useSimulateErc721ApproveMock),
        });

        useWriteErc721ApproveMock.mockReturnValue({
            ...cast(defaultReturnForWriteFn, useWriteErc721ApproveMock),
        });

        useSimulateContractMock.mockReturnValue({
            ...cast(defaultReturnForSimulateFn, useSimulateContractMock),
        });

        useWriteContractMock.mockReturnValue({
            ...cast(defaultReturnForWriteFn, useWriteContractMock),
        });

        useWaitForTransactionReceiptMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isSuccess: false,
        });

        useReadContractsMock.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            data: [
                //symbol
                {
                    result: "MTK",
                    error: undefined,
                },
                // balance
                {
                    result: 1,
                    error: undefined,
                },
            ],
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should display only the application field initially", () => {
        render(<Component {...defaultProps} />);

        expect(screen.getByText("Application")).toBeVisible();
        expect(
            screen.getByText("The application smart contract address"),
        ).toBeVisible();

        expect(screen.queryByText("ERC-721")).not.toBeInTheDocument();
        expect(screen.queryByText("Token ID")).not.toBeInTheDocument();
        expect(screen.queryByText("Approve")).not.toBeInTheDocument();
        expect(screen.queryByText("Advanced")).not.toBeInTheDocument();
        expect(screen.queryByText("Deposit")).not.toBeInTheDocument();
    });

    it("should display all fields after fill application and erc-721 address", async () => {
        render(
            <Component {...defaultProps} applications={[applications[0]]} />,
        );

        await fillFormValues(applications[0], erc721Contracts[0]);

        fireEvent.click(screen.getByText("Advanced"));

        await waitFor(() =>
            expect(screen.getByText("Extra data")).toBeVisible(),
        );

        expect(screen.getByText("ERC-721")).toBeVisible();
        expect(
            screen.getByText("The ERC-721 smart contract address"),
        ).toBeVisible();

        expect(screen.getByText("Token ID")).toBeVisible();
        expect(screen.getByText("Token ID to deposit")).toBeVisible();
        expect(screen.getByText("Balance: 1 MTK")).toBeVisible();
        expect(screen.getByText("Base data")).toBeVisible();

        expect(
            screen.getByText(
                "Base execution layer data handled by the application",
            ),
        ).toBeVisible();

        expect(
            screen.getByText(
                "Extra execution layer data handled by the application",
            ),
        ).toBeVisible();
        expect(screen.getByText("Advanced")).toBeVisible();
        expect(screen.getByText("Approve")).toBeVisible();
        expect(screen.getByText("Deposit")).toBeVisible();
    });

    it("should display required field messages for the Application and ERC-721 addresses", () => {
        render(
            <Component {...defaultProps} applications={[applications[0]]} />,
        );

        const input = screen.getByTestId("application");

        fireEvent.change(input, {
            target: { value: " " },
        });

        expect(screen.getByText("Invalid application address")).toBeVisible();

        fireEvent.change(input, { target: { value: "" } });

        expect(
            screen.getByText("Application address is required!"),
        ).toBeVisible();

        const ercInput = screen.getByTestId("erc721Address");

        fireEvent.change(ercInput, {
            target: { value: " " },
        });

        expect(screen.getByText("Invalid ERC-721 address")).toBeVisible();

        fireEvent.change(ercInput, { target: { value: "" } });

        expect(screen.getByText("ERC-721 address is required!")).toBeVisible();
    });

    it("should display invalid value message for token-id text input", async () => {
        render(
            <Component {...defaultProps} applications={[applications[0]]} />,
        );

        await fillFormValues(applications[0], erc721Contracts[0]);

        fireEvent.change(screen.getByTestId("token-id-input"), {
            target: { value: " " },
        });

        expect(screen.getByText("Invalid token ID")).toBeVisible();
    });

    it("should display invalid hex for extra-data and base-data fields", async () => {
        render(
            <Component {...defaultProps} applications={[applications[0]]} />,
        );

        await fillFormValues(applications[0], erc721Contracts[0]);

        fireEvent.click(screen.getByText("Advanced"));

        await waitFor(() =>
            expect(screen.getByText("Extra data")).toBeVisible(),
        );

        const extraData = screen.getByTestId("extra-data-input");
        const baseData = screen.getByTestId("base-data-input");

        fireEvent.change(extraData, {
            target: { value: "not-a-hex-string" },
        });

        fireEvent.change(baseData, {
            target: { value: "not-a-hex-string-either" },
        });

        expect(
            screen.getByText("Base data must be a valid hex string!"),
        ).toBeVisible();
        expect(
            screen.getByText("Extra data must be a valid hex string!"),
        ).toBeVisible();
    });

    it("should display a select with owned tokens as options when erc-721 contract implements enumerables interface", async () => {
        const tokenIds = [1n, 2n, 10n, 15n];
        useTokensOfOwnerByIndexMock.mockReturnValue({
            fetching: false,
            tokenIds,
        });

        useReadContractsMock.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            data: [
                //symbol
                {
                    result: "MTK",
                    error: undefined,
                },
                // balance
                {
                    result: tokenIds.length,
                    error: undefined,
                },
            ],
        });

        render(
            <Component {...defaultProps} applications={[applications[0]]} />,
        );

        expect(screen.queryByText("15")).not.toBeVisible();

        await fillFormValues(applications[0], erc721Contracts[0]);

        expect(screen.getByText("Balance: 4 MTK")).toBeVisible();

        fireEvent.click(screen.getByTestId("token-id-select"));

        expect(screen.getByText("1")).toBeVisible();
        expect(screen.getByText("2")).toBeVisible();
        expect(screen.getByText("10")).toBeVisible();
        expect(screen.getByText("15")).toBeVisible();
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

            expect(screen.queryByText("ERC-721")).not.toBeInTheDocument();
            expect(screen.queryByText("Token Id")).not.toBeInTheDocument();
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
                expect(screen.getByText("ERC-721")).toBeVisible(),
            );

            expect(screen.getByText("Token ID")).toBeVisible();
            expect(screen.getByText("Advanced")).toBeVisible();
            expect(screen.getByText("Approve")).toBeVisible();
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

            expect(paramsForV1).toHaveProperty("abi", erc721PortalAbi);
            expect(paramsForV1).toHaveProperty("address", erc721PortalAddress);

            fireEvent.click(getByText(options, "Rollup v2"));

            const paramsForV2 =
                useSimulateContractMock.mock.lastCall?.[0] ?? {};

            expect(paramsForV2).toHaveProperty("abi", v2Erc721PortalAbi);
            expect(paramsForV2).toHaveProperty(
                "address",
                v2Erc721PortalAddress,
            );
        });
    });

    describe("Approve", () => {
        it("should be able to click the approve when the token-id is set", async () => {
            const writeContract = vi.fn();

            useSimulateErc721ApproveMock.mockReturnValue({
                ...cast(
                    defaultReturnForSimulateFn,
                    useSimulateErc721ApproveMock,
                ),
                data: {
                    request: {},
                },
            });

            useWriteErc721ApproveMock.mockReturnValue({
                writeContract,
            });

            const app = applications[0];
            const adress = erc721Contracts[0];
            render(<Component {...defaultProps} applications={[app]} />);

            await fillFormValues(app, adress, "10");

            const approveBtn = screen.getByText("Approve");

            expect(approveBtn.closest("button")).not.toBeDisabled();

            fireEvent.click(approveBtn);

            expect(writeContract).toHaveBeenCalledTimes(1);
        });

        it("should be disabled when the user balance is zero", async () => {
            useReadContractsMock.mockReturnValue({
                isLoading: false,
                isSuccess: true,
                data: [
                    {
                        result: "MTK",
                        error: undefined,
                    },
                    {
                        result: 0,
                        error: undefined,
                    },
                ],
            });

            const app = applications[0];
            const token = erc721Contracts[0];
            render(<Component {...defaultProps} applications={[app]} />);

            await fillFormValues(app, token, "10");

            expect(
                screen.getByText("Approve").closest("button"),
            ).toBeDisabled();
        });
    });

    describe("Deposit", () => {
        beforeEach(() => {
            useReadContractsMock.mockReturnValue({
                isLoading: false,
                isSuccess: true,
                data: [
                    {
                        result: "MTK",
                        error: undefined,
                    },
                    {
                        result: 1,
                        error: undefined,
                    },
                ],
            });

            useWriteErc721ApproveMock.mockReturnValue({
                status: "success",
                data: "0x0001",
                reset: () => {},
            });

            useWaitForTransactionReceiptMock.mockImplementation((params) => {
                return params?.hash === "0x0001"
                    ? {
                          status: "success",
                          fetchStatus: "idle",
                          data: { transactionHash: "0x01" },
                      }
                    : {
                          fetchStatus: "idle",
                      };
            });

            useSimulateContractMock.mockReturnValue({
                ...cast(defaultReturnForSimulateFn, useSimulateContractMock),
                data: {
                    request: {},
                },
            });
        });

        it("should not be able to click the deposit when the form is invalid", async () => {
            const app = applications[0];
            const token = erc721Contracts[0];
            const writeContract = vi.fn();

            useWriteContractMock.mockReturnValue({
                writeContract: writeContract,
            });

            render(<Component {...defaultProps} applications={[app]} />);

            await fillFormValues(app, token, "2");

            expect(
                screen.getByText("Deposit").closest("button"),
            ).not.toBeDisabled();

            await fillFormValues(app, token, " ");

            expect(screen.getByText("Invalid token ID")).toBeVisible();

            expect(
                screen.getByText("Deposit").closest("button"),
            ).toBeDisabled();

            fireEvent.click(screen.getByText("Deposit"));

            expect(writeContract).not.toHaveBeenCalled();

            await fillFormValues(app, token, "2");
            expect(
                screen.getByText("Deposit").closest("button"),
            ).not.toBeDisabled();

            await fillFormValues(app, " ", "2");

            expect(screen.getByText("Invalid ERC-721 address")).toBeVisible();

            expect(
                screen.getByText("Deposit").closest("button"),
            ).toBeDisabled();

            fireEvent.click(screen.getByText("Deposit"));

            expect(writeContract).not.toHaveBeenCalled();
        });

        it("should not be able to click the deposit when balance is zero", async () => {
            const app = applications[0];
            const token = erc721Contracts[0];
            const writeContract = vi.fn();

            useReadContractsMock.mockReturnValue({
                isLoading: false,
                isSuccess: true,
                data: [
                    {
                        result: "MTK",
                        error: undefined,
                    },
                    {
                        result: 0,
                        error: undefined,
                    },
                ],
            });

            useWriteContractMock.mockReturnValue({
                writeContract: writeContract,
            });

            render(<Component {...defaultProps} applications={[app]} />);

            await fillFormValues(app, token, "10");

            fireEvent.click(screen.getByText("Deposit"));

            expect(writeContract).not.toHaveBeenCalled();
        });

        it("should be able to click the deposit button after filled form and approved token", async () => {
            const app = applications[0];
            const token = erc721Contracts[0];
            const writeContract = vi.fn();

            useWriteContractMock.mockReturnValue({
                writeContract: writeContract,
            });

            render(<Component {...defaultProps} applications={[app]} />);

            await fillFormValues(app, token, "2");

            await waitFor(() =>
                expect(
                    screen.getByText("Deposit").closest("button"),
                ).not.toBeDisabled(),
            );

            fireEvent.click(screen.getByText("Deposit"));

            expect(writeContract).toHaveBeenCalledTimes(1);
        });
    });

    describe("Transaction feedbacks", () => {
        it("should ask the user to check the wallet when approving", async () => {
            const app = applications[0];
            const token = erc721Contracts[0];

            useWriteErc721ApproveMock.mockReturnValue({
                ...cast(defaultReturnForWriteFn, useWriteErc721ApproveMock),
                status: "pending",
                isPending: true,
            });

            useWaitForTransactionReceiptMock.mockReturnValue({
                fetchStatus: "idle",
                isLoading: false,
                data: undefined,
            });

            render(<Component {...defaultProps} applications={[app]} />);

            await fillFormValues(app, token, "2");

            expect(
                screen.getByText("Approve").closest("button"),
            ).toBeDisabled();

            expect(
                screen.getByText("Deposit").closest("button"),
            ).toBeDisabled();

            expect(screen.getByText("Check wallet...")).toBeVisible();
        });

        it("should show a message while awaiting approval confirmation", async () => {
            const app = applications[0];
            const token = erc721Contracts[0];

            useWriteErc721ApproveMock.mockReturnValue({
                ...cast(defaultReturnForWriteFn, useWriteErc721ApproveMock),
                status: "idle",
                isPending: false,
                data: "0x001",
            });

            useWaitForTransactionReceiptMock.mockImplementation(
                (parameters) => {
                    return parameters?.hash === "0x001"
                        ? {
                              fetchStatus: "fetching",
                              isLoading: true,
                              data: undefined,
                          }
                        : {
                              data: undefined,
                              status: "pending",
                              isLoading: false,
                          };
                },
            );

            render(<Component {...defaultProps} applications={[app]} />);

            await fillFormValues(app, token, "2");

            await waitFor(() =>
                expect(
                    screen.getByText("Waiting for confirmation..."),
                ).toBeVisible(),
            );
        });

        it("should ask the user to check the wallet after start the deposit transaction", async () => {
            const app = applications[0];
            const token = erc721Contracts[0];

            useWriteErc721ApproveMock.mockReturnValue({
                status: "success",
                data: "0x0001",
                reset: () => {},
            });

            useWriteContractMock.mockReturnValue({
                ...cast(defaultReturnForWriteFn, useWriteContractMock),
                status: "pending",
                isPending: true,
                isIdle: false,
            });

            useWaitForTransactionReceiptMock.mockImplementation((params) => {
                return params?.hash === "0x0001"
                    ? {
                          status: "success",
                          fetchStatus: "idle",
                          data: { transactionHash: "0x01" },
                      }
                    : {
                          fetchStatus: "idle",
                      };
            });

            render(<Component {...defaultProps} applications={[app]} />);

            await fillFormValues(app, token, "2");

            expect(
                screen.getByText("Approve").closest("button"),
            ).toBeDisabled();

            expect(
                screen.getByText("Deposit").closest("button"),
            ).toBeDisabled();

            await waitFor(() =>
                expect(screen.getByText("Check wallet...")).toBeVisible(),
            );
        });

        it("should show a message while awaiting deposit confirmation", async () => {
            const app = applications[0];
            const token = erc721Contracts[0];

            useWriteErc721ApproveMock.mockReturnValue({
                status: "success",
                data: "0x0001",
                reset: () => {},
            });

            useWriteContractMock.mockReturnValue({
                ...cast(defaultReturnForWriteFn, useWriteContractMock),
                status: "idle",
                isPending: false,
                data: "0x002",
            });

            useWaitForTransactionReceiptMock.mockImplementation(
                (parameters) => {
                    return parameters?.hash === "0x002"
                        ? {
                              fetchStatus: "fetching",
                              isLoading: true,
                              data: undefined,
                          }
                        : parameters?.hash === "0x0001"
                        ? {
                              status: "success",
                              fetchStatus: "idle",
                              data: { transactionHash: "0x01" },
                          }
                        : {
                              data: undefined,
                              status: "pending",
                              isLoading: false,
                          };
                },
            );

            render(<Component {...defaultProps} applications={[app]} />);

            await fillFormValues(app, token, "1");

            await waitFor(() =>
                expect(
                    screen.getByText("Waiting for confirmation..."),
                ).toBeVisible(),
            );
        });
    });

    describe("When deposit successed", () => {
        it("should reset the form to initial state after the deposit is successful", async () => {
            const app = applications[0];
            const token = erc721Contracts[0];
            const onSearchApplicationsMock = vi.fn();
            const onSuccessMock = vi.fn();

            const depositWaitStatus = factoryWaitStatus();

            useWriteContractMock.mockReturnValue({
                status: "success",
                data: "0x0001",
                reset: () => {
                    depositWaitStatus.reset();
                },
            });

            useWaitForTransactionReceiptMock.mockImplementation((params) => {
                return params?.hash === "0x0001"
                    ? {
                          ...depositWaitStatus.props,
                          fetchStatus: "idle",
                          data: { transactionHash: "0x01" },
                      }
                    : {
                          fetchStatus: "idle",
                      };
            });

            const { rerender } = render(
                <Component
                    {...defaultProps}
                    applications={[app]}
                    onSearchApplications={onSearchApplicationsMock}
                    onSuccess={onSuccessMock}
                />,
            );

            await fillFormValues(app, token, "2");

            expect(onSearchApplicationsMock).toHaveBeenCalledWith("");
            expect(onSuccessMock).toHaveBeenCalledWith({
                receipt: { transactionHash: "0x01" },
                type: "ERC-721",
            });

            rerender(
                <Component
                    {...defaultProps}
                    applications={applications}
                    onSearchApplications={onSearchApplicationsMock}
                    onSuccess={onSuccessMock}
                />,
            );

            await waitFor(() =>
                expect(screen.queryByText("ERC-721")).not.toBeInTheDocument(),
            );

            expect(screen.queryByText("Token ID")).not.toBeInTheDocument();
            expect(screen.queryByText("Advanced")).not.toBeInTheDocument();
            expect(screen.queryByText("Approve")).not.toBeInTheDocument();
            expect(screen.queryByText("Deposit")).not.toBeInTheDocument();
        });
    });
});
