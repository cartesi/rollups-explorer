import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WithdrawalView } from "../../../src/components/withdrawal/WithdrawalView";
import { content } from "../../../src/content";
import { createWithdrawal, fireEvent, render, screen } from "../../test-utils";

const mocks = vi.hoisted(() => ({
    decodeFunctionData: vi.fn(),
    useVoucherDecoder: vi.fn(),
}));

vi.mock("viem", async (importOriginal) => ({
    ...(await importOriginal<typeof import("viem")>()),
    decodeFunctionData: mocks.decodeFunctionData,
}));

vi.mock(
    "../../../src/components/specification/hooks/useVoucherDecoder",
    () => ({
        default: mocks.useVoucherDecoder,
    }),
);

vi.mock("../../../src/components/JSONViewer", () => ({
    default: ({ content: json }: { content: string }) => (
        <pre data-testid="decoded-content">{json}</pre>
    ),
}));

describe("WithdrawalView", () => {
    beforeEach(() => {
        mocks.decodeFunctionData.mockReturnValue({
            functionName: "Voucher",
            args: ["0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", 0n, "0x"],
        });
        mocks.useVoucherDecoder.mockReturnValue({ data: null });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("shows the output decoding error when the withdrawal output is invalid", () => {
        mocks.decodeFunctionData.mockReturnValue({
            functionName: "Notice",
            args: [],
        });

        render(<WithdrawalView withdrawal={createWithdrawal()} />);

        expect(screen.getByRole("alert")).toHaveTextContent(
            content.withdrawal.error.output.nonExecutable,
        );

        expect(
            screen.queryByRole("switch", {
                name: content.global.decoded.show,
            }),
        ).not.toBeInTheDocument();
    });

    it("shows a warning when the destination payload cannot be decoded", () => {
        mocks.useVoucherDecoder.mockReturnValue({ data: "0xdeadbeef" });

        render(<WithdrawalView withdrawal={createWithdrawal()} />);

        expect(
            screen.getByText(content.withdrawal.error.decode.destination),
        ).toBeVisible();

        expect(
            screen.queryByRole("switch", {
                name: content.global.decoded.show,
            }),
        ).not.toBeInTheDocument();
    });

    it("does not show alerts while destination payload decoding is loading", () => {
        mocks.useVoucherDecoder.mockReturnValue({
            status: "loading",
            data: null,
        });

        render(<WithdrawalView withdrawal={createWithdrawal()} />);

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows decoded data after the decoded-data switch is enabled", () => {
        mocks.useVoucherDecoder.mockReturnValue({ data: '{"type":"Ether"}' });

        render(<WithdrawalView withdrawal={createWithdrawal()} />);

        const decodedDataSwitch = screen.getByRole("switch", {
            name: content.global.decoded.show,
        });

        expect(decodedDataSwitch).toBeEnabled();

        fireEvent.click(decodedDataSwitch);

        expect(screen.getByTestId("decoded-content")).toHaveTextContent(
            '{"type":"Ether"}',
        );
    });
});
