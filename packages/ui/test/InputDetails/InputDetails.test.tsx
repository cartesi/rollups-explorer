import {
    cleanup,
    fireEvent,
    getByDisplayValue,
    getByLabelText,
    getByTestId,
    getByText,
    queryByText,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { describe, expect, it } from "vitest";
import {
    InputContent,
    InputDetails,
    NoticeContent,
    ReportContent,
    VoucherContent,
} from "../../src/InputDetails/index";
import withMantineTheme from "../utils/WithMantineTheme";
import { jsonWithdraw0, queryContentAsHex, reportText } from "./mocks";

const InputDetailsE = withMantineTheme(InputDetails);

describe("Rollups InputDetails", () => {
    beforeEach(() => cleanup());

    it("Should render all the tabs and contents", () => {
        render(
            <InputDetailsE>
                <InputContent content={queryContentAsHex} contentType="raw" />
                <VoucherContent content={jsonWithdraw0} contentType="json" />
                <NoticeContent content={reportText} contentType="text" />
                <ReportContent content={reportText} contentType="text" />
            </InputDetailsE>,
        );

        expect(screen.getByText("Input")).toBeInTheDocument();
        expect(screen.getByText("Vouchers")).toBeInTheDocument();
        expect(screen.getByText("Reports")).toBeInTheDocument();
        expect(screen.getByText("Notices")).toBeInTheDocument();

        const inputContentArea = screen.getByRole("tabpanel");
        expect(getByText(inputContentArea, "Raw")).toBeInTheDocument();
        expect(getByText(inputContentArea, "As Text")).toBeInTheDocument();
        expect(getByText(inputContentArea, "As JSON")).toBeInTheDocument();
        expect(
            getByDisplayValue(inputContentArea, queryContentAsHex),
        ).toBeInTheDocument();
    });

    it("should inform client that the content-type control change in the input-content section", () => {
        const inputContentCB = vi.fn();
        render(
            <InputDetailsE>
                <InputContent
                    content={queryContentAsHex}
                    contentType="raw"
                    onContentTypeChange={inputContentCB}
                />
            </InputDetailsE>,
        );

        fireEvent.click(screen.getByText("As JSON"));
        fireEvent.click(screen.getByText("As Text"));
        fireEvent.click(screen.getByText("Raw"));
        expect(inputContentCB).toHaveBeenCalledTimes(3);
        expect(inputContentCB).toHaveBeenCalledWith("json");
        expect(inputContentCB).toHaveBeenCalledWith("text");
        expect(inputContentCB).toHaveBeenCalledWith("raw");
    });

    it("should inform client that the content-type control change in the report-content section", () => {
        const callback = vi.fn();
        render(
            <InputDetailsE>
                <ReportContent
                    content={reportText}
                    contentType="raw"
                    onContentTypeChange={callback}
                />
            </InputDetailsE>,
        );

        fireEvent.click(screen.getByText("Reports"));
        fireEvent.click(screen.getByText("As JSON"));
        fireEvent.click(screen.getByText("As Text"));
        fireEvent.click(screen.getByText("Raw"));
        expect(callback).toHaveBeenCalledTimes(3);
        expect(callback).toHaveBeenCalledWith("json");
        expect(callback).toHaveBeenCalledWith("text");
        expect(callback).toHaveBeenCalledWith("raw");
    });

    it("should inform client that the content-type control change in the voucher-content section", () => {
        const callback = vi.fn();
        render(
            <InputDetailsE>
                <VoucherContent
                    content={jsonWithdraw0}
                    contentType="raw"
                    onContentTypeChange={callback}
                />
            </InputDetailsE>,
        );

        fireEvent.click(screen.getByText("Vouchers"));
        fireEvent.click(screen.getByText("As JSON"));
        fireEvent.click(screen.getByText("As Text"));
        fireEvent.click(screen.getByText("Raw"));
        expect(callback).toHaveBeenCalledTimes(3);
        expect(callback).toHaveBeenCalledWith("json");
        expect(callback).toHaveBeenCalledWith("text");
        expect(callback).toHaveBeenCalledWith("raw");
    });

    it("should inform client that the content-type control change in the notice-content section", () => {
        const callback = vi.fn();
        render(
            <InputDetailsE>
                <NoticeContent
                    content={reportText}
                    contentType="raw"
                    onContentTypeChange={callback}
                />
            </InputDetailsE>,
        );

        fireEvent.click(screen.getByText("Notices"));
        fireEvent.click(screen.getByText("As JSON"));
        fireEvent.click(screen.getByText("As Text"));
        fireEvent.click(screen.getByText("Raw"));
        expect(callback).toHaveBeenCalledTimes(3);
        expect(callback).toHaveBeenCalledWith("json");
        expect(callback).toHaveBeenCalledWith("text");
        expect(callback).toHaveBeenCalledWith("raw");
    });

    it("should disable the tabs when an specific content is logically not rendered", () => {
        render(
            <InputDetailsE>
                <InputContent content={queryContentAsHex} contentType="raw" />
                <VoucherContent content={jsonWithdraw0} contentType="json" />
            </InputDetailsE>,
        );

        expect(screen.getByText("Reports")).toBeInTheDocument();
        expect(screen.getByText("Notices")).toBeInTheDocument();

        expect(screen.getByText("Reports").closest("button")).toBeDisabled();
        expect(screen.getByText("Notices").closest("button")).toBeDisabled();
    });

    it("should display paging information when available", async () => {
        const onNext = vi.fn();
        const onPrev = vi.fn();
        render(
            <InputDetailsE>
                <InputContent content={queryContentAsHex} contentType="raw" />
                <VoucherContent
                    content={jsonWithdraw0}
                    contentType="json"
                    paging={{
                        onNextPage: onNext,
                        onPreviousPage: onPrev,
                        total: 3,
                    }}
                />
            </InputDetailsE>,
        );

        act(() => {
            fireEvent.click(screen.getByText("Vouchers"));
        });

        await waitFor(() =>
            expect(screen.getByTestId("panel-vouchers")).not.toHaveStyle(
                "display: none",
            ),
        );

        const voucherPanel = screen.getByTestId("panel-vouchers");

        expect(getByText(voucherPanel, "1 of 3")).toBeInTheDocument();
        expect(
            getByLabelText(voucherPanel, "Button to load the previous content"),
        ).toBeInTheDocument();

        expect(
            getByLabelText(voucherPanel, "Button to load the previous content"),
        ).toBeDisabled();

        expect(
            getByLabelText(voucherPanel, "Button to load the next content"),
        ).toBeInTheDocument();
    });

    it("should display a connect button when voucher|notice|report is disconnected and fire onConnect when clicked", async () => {
        const onConnect = vi.fn();
        render(
            <InputDetailsE>
                <InputContent content={queryContentAsHex} contentType="raw" />
                <VoucherContent
                    isConnected={false}
                    onConnect={onConnect}
                    content={jsonWithdraw0}
                    contentType="json"
                />
            </InputDetailsE>,
        );

        act(() => {
            fireEvent.click(screen.getByText("Vouchers"));
        });

        await waitFor(() =>
            expect(screen.getByTestId("panel-vouchers")).not.toHaveStyle(
                "display: none",
            ),
        );

        const voucherPanel = screen.getByTestId("panel-vouchers");

        act(() => {
            fireEvent.click(getByText(voucherPanel, "Connect"));
        });

        expect(queryByText(voucherPanel, "Raw")).not.toBeInTheDocument();
        expect(queryByText(voucherPanel, "As Text")).not.toBeInTheDocument();
        expect(queryByText(voucherPanel, "As JSON")).not.toBeInTheDocument();
        expect(getByText(voucherPanel, "Connect")).toBeInTheDocument();

        expect(onConnect).toHaveBeenCalledTimes(1);
    });

    it("should display a overlay spinner when the content is loading", async () => {
        render(
            <InputDetailsE>
                <InputContent content={queryContentAsHex} contentType="raw" />
                <VoucherContent
                    isLoading={true}
                    content={""}
                    contentType="json"
                />
                <ReportContent content="" contentType="raw" isLoading={true} />
            </InputDetailsE>,
        );

        const panelName = "panel-vouchers";

        act(() => {
            fireEvent.click(screen.getByText("Vouchers"));
        });

        await waitFor(() =>
            expect(screen.getByTestId(panelName)).not.toHaveStyle(
                "display: none",
            ),
        );

        const voucherPanel = screen.getByTestId(panelName);

        expect(
            getByTestId(voucherPanel, "loading-overlay-vouchercontent"),
        ).toBeInTheDocument();
    });
});
