import {
    useReadCartesiDAppWasVoucherExecuted,
    useSimulateCartesiDAppExecuteVoucher,
    useWriteCartesiDAppExecuteVoucher,
} from "@cartesi/rollups-wagmi";
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, describe, it } from "vitest";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import VoucherExecution from "../../../src/components/inputs/voucherExecution";
import { Voucher } from "../../../src/graphql/rollups/types";
import { withMantineTheme } from "../../utils/WithMantineTheme";

vi.mock("@cartesi/rollups-wagmi");
vi.mock("@mantine/notifications", async () => {
    const actual = await vi.importActual("@mantine/notifications");
    return {
        ...(actual as any),
        notifications: {
            show: () => undefined,
        },
    };
});
vi.mock("wagmi");

const useReadCartesiDAppWasVoucherExecutedMock = vi.mocked(
    useReadCartesiDAppWasVoucherExecuted,
    true,
);
const useWriteCartesiDAppExecuteVoucherMock = vi.mocked(
    useWriteCartesiDAppExecuteVoucher,
    true,
);
const useSimulateCartesiDAppExecuteVoucherMock = vi.mocked(
    useSimulateCartesiDAppExecuteVoucher,
    true,
);
const useAccountMock = vi.mocked(useAccount, true);
const useWaitForTransactionReceiptMock = vi.mocked(
    useWaitForTransactionReceipt,
    true,
);

const Component = withMantineTheme(VoucherExecution);
const defaultProps = {
    appId: "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C" as `0x${string}`,
    voucher: {
        index: 0,
        destination: "0xa2887b3a8f75c1de921ed2b1ba6a41b2692d961c",
        payload:
            "0xd0def521000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002e516d587a3947636f535a466d35624d4758394e7848546e6650763241377a4555356d61647a4a426a62725633465a000000000000000000000000000000000000",
        input: {
            index: 0,
        },
        proof: {
            context:
                "0x0000000000000000000000000000000000000000000000000000000000000000",
            validity: {
                inputIndexWithinEpoch: 0,
                outputIndexWithinInput: 0,
                outputHashesRootHash:
                    "0xfce2caa4525ff598c98f8b6c82ce17e299335522d3d5004d87fc59796ee30e1c",
                vouchersEpochRootHash:
                    "0xe169b4cb7c3a2d8770fffd0165085ba75c74a54b9267115e53150df4fb4b61e9",
                noticesEpochRootHash:
                    "0xf67fc2cd8333c2c37811ac104dfb38d939b81452975c90ef62add0d43d97ab61",
                machineStateHash:
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
                outputHashInOutputHashesSiblings: [
                    "0xae39ce8537aca75e2eff3e38c98011dfe934e700a0967732fc07b430dd656a23",
                ],
                outputHashesInEpochSiblings: [
                    "0x290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563",
                ],
            },
        },
    } as Partial<Voucher>,
};

describe("VoucherExecution component", () => {
    beforeEach(() => {
        useReadCartesiDAppWasVoucherExecutedMock.mockReturnValue({
            data: false,
            isLoading: false,
        } as any);
        useSimulateCartesiDAppExecuteVoucherMock.mockReturnValue({
            data: {
                request: {},
            },
        } as any);
        useWriteCartesiDAppExecuteVoucherMock.mockReturnValue({
            status: "idle",
            isLoading: false,
            writeContract: () => undefined,
        } as any);
        useWaitForTransactionReceiptMock.mockReturnValue({
            status: "idle",
            isLoading: false,
        } as any);
        useAccountMock.mockReturnValue({
            isConnected: true,
        } as any);
    });
    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display spinner while loading voucher data", () => {
        useReadCartesiDAppWasVoucherExecutedMock.mockReturnValue({
            data: false,
            isLoading: true,
        } as any);

        render(<Component {...defaultProps} />);
        expect(
            screen.getByTestId("voucher-execution-loader"),
        ).toBeInTheDocument();
    });

    it("should display disabled button when voucher is already executed", () => {
        useReadCartesiDAppWasVoucherExecutedMock.mockReturnValue({
            data: true,
            isLoading: false,
        } as any);

        render(<Component {...defaultProps} />);
        expect(screen.getByText("Executed")).toBeInTheDocument();

        const button = screen
            .getByText("Executed")
            .closest("button") as HTMLButtonElement;
        expect(button.hasAttribute("disabled")).toBe(true);
    });

    it("should display enabled button when voucher is not yet executed", async () => {
        useReadCartesiDAppWasVoucherExecutedMock.mockReturnValue({
            data: false,
            isLoading: false,
        } as any);

        render(<Component {...defaultProps} />);
        expect(screen.getByText("Execute")).toBeInTheDocument();

        const button = screen
            .getByText("Execute")
            .closest("button") as HTMLButtonElement;
        await waitFor(
            () => expect(button.hasAttribute("disabled")).toBe(false),
            {
                timeout: 500,
            },
        );
    });

    it("should display tooltip when voucher is pending", async () => {
        useReadCartesiDAppWasVoucherExecutedMock.mockReturnValue({
            data: false,
            isLoading: false,
        } as any);

        render(
            <Component
                {...defaultProps}
                voucher={{
                    ...defaultProps.voucher,
                    proof: null,
                }}
            />,
        );

        const button = screen
            .getByText("Execute")
            .closest("button") as HTMLButtonElement;
        expect(button.hasAttribute("disabled")).toBe(true);

        fireEvent.mouseEnter(button);
        await waitFor(() =>
            expect(
                screen.getByText("Voucher proof is pending"),
            ).toBeInTheDocument(),
        );
    });

    it("should display tooltip when wallet is not connected and voucher is not executed", async () => {
        useReadCartesiDAppWasVoucherExecutedMock.mockReturnValue({
            data: false,
            isLoading: false,
        } as any);
        useAccountMock.mockReturnValue({
            isConnected: false,
        } as any);

        render(<Component {...defaultProps} />);

        const button = screen
            .getByText("Execute")
            .closest("button") as HTMLButtonElement;
        expect(button.hasAttribute("disabled")).toBe(true);

        fireEvent.mouseEnter(button);
        await waitFor(() =>
            expect(
                screen.getByText("Connect your wallet to execute the voucher"),
            ).toBeInTheDocument(),
        );
    });

    it("should execute voucher when button is clicked", () => {
        useReadCartesiDAppWasVoucherExecutedMock.mockReturnValue({
            data: false,
            isLoading: false,
        } as any);

        const mockedWrite = vi.fn();
        useWriteCartesiDAppExecuteVoucherMock.mockReturnValue({
            status: "idle",
            isLoading: false,
            writeContract: mockedWrite,
        } as any);

        render(<Component {...defaultProps} />);

        const button = screen
            .getByText("Execute")
            .closest("button") as HTMLButtonElement;

        fireEvent.click(button);
        expect(mockedWrite).toHaveBeenCalledOnce();
    });

    it("should display a loading button while executing voucher", () => {
        useReadCartesiDAppWasVoucherExecutedMock.mockReturnValue({
            data: false,
            isLoading: false,
        } as any);

        const mockedWrite = vi.fn();
        useWriteCartesiDAppExecuteVoucherMock.mockReturnValue({
            status: "idle",
            isLoading: true,
            writeContract: mockedWrite,
        } as any);
        useWaitForTransactionReceiptMock.mockReturnValue({
            status: "loading",
            isLoading: true,
        } as any);

        render(<Component {...defaultProps} />);

        const button = screen
            .getByText("Execute")
            .closest("button") as HTMLButtonElement;
        expect(button.getAttribute("data-loading")).toBe("true");
    });

    it("should not display a notification until transaction is successful", async () => {
        const mantineNotifications = await import("@mantine/notifications");
        const showMock = vi.fn();
        mantineNotifications.notifications = {
            ...mantineNotifications.notifications,
            show: showMock,
        } as any;

        useWriteCartesiDAppExecuteVoucherMock.mockReturnValue({
            status: "success",
            isLoading: true,
        } as any);
        useWaitForTransactionReceiptMock.mockReturnValue({
            status: "idle",
            isLoading: true,
        } as any);

        render(<Component {...defaultProps} />);

        expect(showMock).toHaveBeenCalledTimes(0);
    });

    it("should display a notification after voucher has been successfully executed and transaction for it is successful", async () => {
        const mantineNotifications = await import("@mantine/notifications");
        const showMock = vi.fn();
        mantineNotifications.notifications = {
            ...mantineNotifications.notifications,
            show: showMock,
        } as any;

        useWriteCartesiDAppExecuteVoucherMock.mockReturnValue({
            status: "success",
            isLoading: true,
        } as any);
        useWaitForTransactionReceiptMock.mockReturnValue({
            isSuccess: true,
            isLoading: false,
        } as any);

        render(<Component {...defaultProps} />);

        expect(showMock).toHaveBeenCalledWith({
            message: "Voucher executed successfully",
            color: "green",
            withBorder: true,
        });
    });
});
