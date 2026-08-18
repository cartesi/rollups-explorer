import { encodeNotice, encodeVoucher } from "@cartesi/codec";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WithdrawalView } from "../../../src/components/withdrawal/WithdrawalView";
import { content } from "../../../src/content";
import { createWithdrawal, fireEvent, render, screen } from "../../test-utils";

const mocks = vi.hoisted(() => ({
    useVoucherDecoder: vi.fn(),
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

const voucherOutput = encodeVoucher({
    destination: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    value: 0n,
    payload: "0x",
});

describe("WithdrawalView", () => {
    beforeEach(() => {
        mocks.useVoucherDecoder.mockReturnValue({ data: null });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("shows the output decoding error when the withdrawal output is not executable", () => {
        const output = encodeNotice({ payload: "0x" });

        render(<WithdrawalView withdrawal={createWithdrawal({ output })} />);

        expect(screen.getByRole("alert")).toHaveTextContent(
            content.withdrawal.error.output.nonExecutable,
        );

        expect(
            screen.queryByRole("switch", {
                name: content.global.decoded.show,
            }),
        ).not.toBeInTheDocument();
    });

    it("shows the output decoding error when the withdrawal output cannot be decoded", () => {
        render(<WithdrawalView withdrawal={createWithdrawal()} />);

        expect(screen.getByRole("alert")).toBeVisible();

        expect(
            screen.queryByRole("switch", {
                name: content.global.decoded.show,
            }),
        ).not.toBeInTheDocument();
    });

    it("shows a warning when the destination payload cannot be decoded", () => {
        mocks.useVoucherDecoder.mockReturnValue({ data: "0xdeadbeef" });

        render(
            <WithdrawalView
                withdrawal={createWithdrawal({ output: voucherOutput })}
            />,
        );

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

        render(
            <WithdrawalView
                withdrawal={createWithdrawal({ output: voucherOutput })}
            />,
        );

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows decoded data after the decoded-data switch is enabled", () => {
        mocks.useVoucherDecoder.mockReturnValue({ data: '{"type":"Ether"}' });

        render(
            <WithdrawalView
                withdrawal={createWithdrawal({ output: voucherOutput })}
            />,
        );

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
