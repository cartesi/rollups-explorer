import {
    useSimulateDAppAddressRelayRelayDAppAddress,
    useWriteDAppAddressRelayRelayDAppAddress,
} from "@cartesi/rollups-wagmi";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as viem from "viem";
import { afterEach, beforeEach, describe, it } from "vitest";
import { useWaitForTransactionReceipt } from "wagmi";
import { AddressRelayForm } from "../src";
import { AddressRelayFormProps } from "../src/AddressRelayForm";
import withMantineTheme from "./utils/WithMantineTheme";
import { applications } from "./utils/stubs";

vi.mock("@cartesi/rollups-wagmi");
vi.mock("wagmi");
vi.mock("viem", async () => {
    const actual = await vi.importActual<typeof viem>("viem");
    return {
        ...actual,
        getAddress: (address: string) => address,
    };
});

const useSimulateRelayDAppAddressMock = vi.mocked(
    useSimulateDAppAddressRelayRelayDAppAddress,
    { partial: true },
);
const useWriteRelayDAppAddressMock = vi.mocked(
    useWriteDAppAddressRelayRelayDAppAddress,
    { partial: true },
);

const useWaitForTransactionReceiptMock = vi.mocked(
    useWaitForTransactionReceipt,
    { partial: true },
);

const Component = withMantineTheme(AddressRelayForm);

const defaultProps: AddressRelayFormProps = {
    applications: applications,
    isLoadingApplications: false,
    onSearchApplications: vi.fn(),
    onSuccess: vi.fn(),
};

describe("AddressRelayForm", () => {
    beforeEach(() => {
        useSimulateRelayDAppAddressMock.mockReturnValue({
            isPending: false,
            isLoading: false,
            fetchStatus: "idle",
            data: { request: {} },
            error: null,
        });

        useWriteRelayDAppAddressMock.mockReturnValue({
            isIdle: true,
            isError: false,
            status: "idle",
            reset: () => {},
        });

        useWaitForTransactionReceiptMock.mockReturnValue({
            status: "pending",
            fetchStatus: "idle",
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display expected fields", () => {
        render(<Component {...defaultProps} />);

        expect(screen.getByText("Application")).toBeInTheDocument();
        expect(screen.getByText("The application address to relay."));
    });

    it("should display error when application is not an address", () => {
        render(<Component {...defaultProps} />);

        fireEvent.change(screen.getByTestId("application"), {
            target: { value: "non-valid-address" },
        });

        expect(
            screen.getByText("Invalid application address"),
        ).toBeInTheDocument();
    });

    it("should display an warning message for underployed application", async () => {
        render(<Component {...defaultProps} />);

        fireEvent.change(screen.getByTestId("application"), {
            target: { value: "0x7bd3565af78d8457c81ff8b4870a174fa3783eb0" },
        });

        expect(
            await screen.findByText("This is an undeployed application."),
        ).toBeVisible();
    });

    it("should be able to click the send button when form is valid", () => {
        const writeContract = vi.fn();

        useWriteRelayDAppAddressMock.mockReturnValue({
            writeContract,
            data: "0x0002",
            status: "idle",
        });

        render(<Component {...defaultProps} />);

        fireEvent.change(screen.getByTestId("application"), {
            target: { value: applications[0] },
        });

        fireEvent.click(screen.getByText("Send"));

        expect(writeContract).toHaveBeenCalledTimes(1);
    });

    it("should display feedback while waiting transaction confirmation", () => {
        useWriteRelayDAppAddressMock.mockReturnValue({
            isIdle: false,
            status: "pending",
            data: "0x0001",
        });

        useWaitForTransactionReceiptMock.mockImplementation((params) => {
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
        });

        render(<Component {...defaultProps} />);

        fireEvent.change(screen.getByTestId("application"), {
            target: { value: applications[0] },
        });

        const btn = screen.getByText("Send").closest("button");
        expect(btn?.getAttribute("data-loading")).toEqual("true");
        expect(screen.getByText("Waiting for confirmation...")).toBeVisible();
    });

    it("should cleanup and call onSuccess once the transaction is confirmed", async () => {
        const executeReset = vi.fn();
        // Avoiding infinite loop by making a computed prop change when deposit reset is called.
        const executeWaitStatus = {
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

        useWriteRelayDAppAddressMock.mockReturnValue({
            status: "success",
            data: "0x0001",
            reset: () => {
                executeReset();
                executeWaitStatus.reset();
            },
        });

        useWaitForTransactionReceiptMock.mockImplementation((params) => {
            return params?.hash === "0x0001"
                ? {
                      ...executeWaitStatus.props,
                      fetchStatus: "idle",
                      data: { transactionHash: "0x01" },
                  }
                : {
                      fetchStatus: "idle",
                  };
        });

        const onSuccess = vi.fn();

        render(<Component {...defaultProps} onSuccess={onSuccess} />);

        fireEvent.change(screen.getByTestId("application"), {
            target: { value: applications[0] },
        });

        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(executeReset).toHaveBeenCalledTimes(1);
    });

    it("should display error message when transaction fails", () => {
        useWriteRelayDAppAddressMock.mockReturnValue({
            isError: true,
            status: "error",
            data: "0x0001",
        });

        useWaitForTransactionReceiptMock.mockImplementation((params) => {
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
        });

        render(<Component {...defaultProps} />);
        fireEvent.change(screen.getByTestId("application"), {
            target: { value: applications[0] },
        });

        const btn = screen.getByText("Send").closest("button");
        expect(btn).not.toBeDisabled();

        expect(screen.getByText("Transaction reverted!")).toBeVisible();
        expect(screen.queryByText("Check wallet...")).not.toBeInTheDocument();

        expect(
            screen.queryByText("Waiting for confirmation..."),
        ).not.toBeInTheDocument();
    });

    it("should invoke onSuccess callback after successful deposit", () => {
        useWaitForTransactionReceiptMock.mockReturnValue({
            error: null,
            isSuccess: true,
        });

        const onSuccessMock = vi.fn();
        render(<Component {...defaultProps} onSuccess={onSuccessMock} />);

        expect(onSuccessMock).toHaveBeenCalled();
    });
});
