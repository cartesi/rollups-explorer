import {
    useReadApplicationIsForeclosed,
    useSimulateApplicationForeclose,
    useWriteApplicationForeclose,
} from "@cartesi/wagmi";
import type { WriteContractErrorType } from "viem/actions";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import type { SimulateContractErrorType } from "wagmi/actions";
import { ForecloseForm } from "../../../../src/components/transactions/ForecloseForm";
import { content } from "../../../../src/content";
import {
    createApplication,
    fireEvent,
    render,
    screen,
    waitFor,
} from "../../../test-utils";

const mocks = vi.hoisted(() => ({
    useReadApplicationIsForeclosed: vi.fn(),
    useSimulateApplicationForeclose: vi.fn(),
    useWriteApplicationForeclose: vi.fn(),
    useAccount: vi.fn(),
    useWaitForTransactionReceipt: vi.fn(),
}));

vi.mock("@cartesi/wagmi", () => ({
    useReadApplicationIsForeclosed: mocks.useReadApplicationIsForeclosed,
    useSimulateApplicationForeclose: mocks.useSimulateApplicationForeclose,
    useWriteApplicationForeclose: mocks.useWriteApplicationForeclose,
}));

vi.mock("wagmi", () => ({
    useAccount: mocks.useAccount,
    useWaitForTransactionReceipt: mocks.useWaitForTransactionReceipt,
}));

const mockUseReadIsForeclosed = vi.mocked(useReadApplicationIsForeclosed, {
    partial: true,
});
const mockUseSimulateForeclose = vi.mocked(useSimulateApplicationForeclose, {
    partial: true,
});
const mockUseWriteForeclose = vi.mocked(useWriteApplicationForeclose, {
    partial: true,
});
const mockUseAccount = vi.mocked(useAccount, { partial: true });
const mockUseWaitForTx = vi.mocked(useWaitForTransactionReceipt, {
    partial: true,
});

const mockApplication = createApplication();

const setupCommonMocks = () => {
    const refetch = vi.fn();
    const writeContract = vi.fn();
    const reset = vi.fn();

    mockUseAccount.mockReturnValue({ address: "0xaddress" });

    mockUseReadIsForeclosed.mockReturnValue({
        data: false,
        isLoading: false,
        refetch,
    });

    mockUseSimulateForeclose.mockReturnValue({
        data: { request: {} },
        isLoading: false,
        error: null,
    });

    mockUseWriteForeclose.mockReturnValue({
        writeContract,
        data: undefined,
        isPending: false,
        isSuccess: false,
        isError: false,
        reset,
    });

    mockUseWaitForTx.mockReturnValue({
        isLoading: false,
        isSuccess: false,
    });

    return { refetch, writeContract, reset };
};

describe("ForecloseForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should disable the Foreclose button when the application is already foreclosed and change the button text to 'Foreclosed'", () => {
        setupCommonMocks();
        mockUseReadIsForeclosed.mockReturnValue({
            data: true,
            isLoading: false,
            refetch: vi.fn(),
        });

        render(
            <ForecloseForm application={mockApplication} onSuccess={vi.fn()} />,
        );

        expect(
            screen.getByRole("button", {
                name: content.foreclose.foreclosedTxt,
            }),
        ).toBeDisabled();
    });

    it("should disable the Foreclose button when the simulate call fails", async () => {
        setupCommonMocks();
        mockUseSimulateForeclose.mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
            error: new Error(
                "Simulate error while foreclosing",
            ) as SimulateContractErrorType,
        });

        render(
            <ForecloseForm application={mockApplication} onSuccess={vi.fn()} />,
        );

        await waitFor(() =>
            expect(screen.getByTestId("foreclose-progress")).toBeVisible(),
        );

        expect(screen.getByText("Transaction failed")).toBeVisible();

        fireEvent.click(
            screen.getByTestId("transaction-progress-error-toggle"),
        );

        await waitFor(() =>
            expect(
                screen.getByText("Simulate error while foreclosing"),
            ).toBeVisible(),
        );

        expect(
            screen.getByRole("button", {
                name: content.foreclose.forecloseTxt,
            }),
        ).toBeDisabled();
    });

    it("should display the error message when the execute call fails", () => {
        const { writeContract } = setupCommonMocks();
        mockUseWriteForeclose.mockReturnValue({
            writeContract,
            data: undefined,
            isPending: false,
            isSuccess: false,
            isError: true,
            error: {
                message: "Execution reverted with message xpto",
            } as WriteContractErrorType,
            reset: vi.fn(),
        });

        render(
            <ForecloseForm application={mockApplication} onSuccess={vi.fn()} />,
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: content.foreclose.forecloseTxt,
            }),
        );

        expect(writeContract).toHaveBeenCalled();
        // TransactionProgress renders the error message in multiple places
        expect(
            screen.getAllByText("Execution reverted with message xpto")[0],
        ).toBeInTheDocument();
    });

    it("should call onSuccess with the correct data when the foreclose transaction succeeds", () => {
        const { refetch, reset } = setupCommonMocks();
        const receipt = { status: "success" };

        mockUseWriteForeclose.mockReturnValue({
            writeContract: vi.fn(),
            data: "0x12345678901234567890123456789012345678901234567890123456789012345",
            isPending: false,
            isSuccess: true,
            isError: false,
            reset,
        });

        mockUseWaitForTx.mockReturnValue({
            data: receipt,
            isLoading: false,
            isSuccess: true,
        });

        const onSuccess = vi.fn();

        render(
            <ForecloseForm
                application={mockApplication}
                onSuccess={onSuccess}
            />,
        );

        expect(onSuccess).toHaveBeenCalledWith({
            receipt,
            type: "FORECLOSE",
            message: content.foreclose.generic.txSuccess,
        });
        expect(refetch).toHaveBeenCalled();
        expect(reset).toHaveBeenCalled();
    });

    it("should display the application address upon opening the form", () => {
        setupCommonMocks();

        render(
            <ForecloseForm application={mockApplication} onSuccess={vi.fn()} />,
        );

        expect(screen.getByText("Application Address")).toBeVisible();
        expect(
            screen.getByText(mockApplication.applicationAddress),
        ).toBeVisible();
    });

    it("should display the foreclosure info warning message", () => {
        setupCommonMocks();

        render(
            <ForecloseForm application={mockApplication} onSuccess={vi.fn()} />,
        );

        expect(screen.getByText(content.global.alert.reminder)).toBeVisible();
        expect(
            screen.getByText(content.foreclose.foreclosingWarning),
        ).toBeVisible();
    });
});
