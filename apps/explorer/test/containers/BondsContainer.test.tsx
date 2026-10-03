import { ReadonlyURLSearchParams } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BondsContainer } from "../../src/containers/BondsContainer";
import type { BondsPageProps } from "../../src/page/BondsPage";
import { createBondEvent } from "../../src/stories/prt";
import { render, screen } from "../test-utils";

const mocks = vi.hoisted(() => ({
    useBondEvents: vi.fn(),
    useBondEventSummary: vi.fn(),
    useSearchParams: vi.fn(),
}));

vi.mock("@cartesi/react", () => ({
    useBondEvents: mocks.useBondEvents,
}));

vi.mock("../../src/hooks/useBondEventSummary", () => ({
    useBondEventSummary: mocks.useBondEventSummary,
}));

vi.mock("next/navigation", async (importOriginal) => ({
    ...(await importOriginal<typeof import("next/navigation")>()),
    useSearchParams: mocks.useSearchParams,
}));

vi.mock("../../src/page/BondsPage", () => ({
    BondsPage: ({ epochIndex, events, limit, pagination }: BondsPageProps) => (
        <div data-testid="bonds-page">
            {epochIndex?.toString() ?? "all"}/{events.length}/{limit}/
            {pagination.offset}/{pagination.totalCount}
        </div>
    ),
}));

const application = "0x1234567890abcdef1234567890abcdef12345678";
const pagination = { limit: 10, offset: 20, totalCount: 42 };

describe("BondsContainer", () => {
    beforeEach(() => {
        mocks.useBondEvents.mockReturnValue({
            data: { data: [createBondEvent()], pagination },
            isLoading: false,
            error: null,
        });
        mocks.useBondEventSummary.mockReturnValue({
            data: undefined,
            isLoading: false,
        });
    });

    it("should request one page of every epoch by default", () => {
        mocks.useSearchParams.mockReturnValue(new ReadonlyURLSearchParams());

        render(<BondsContainer application={application} />);

        expect(screen.getByTestId("bonds-page")).toHaveTextContent(
            "all/1/50/20/42",
        );
        expect(mocks.useBondEvents).toHaveBeenCalledWith({
            application,
            epochIndex: undefined,
            limit: 50,
            offset: 0,
            descending: true,
        });
    });

    it("should read the epoch, limit and offset from the url", () => {
        mocks.useSearchParams.mockReturnValue(
            new ReadonlyURLSearchParams("epoch=3&lv=10&offset=20"),
        );

        render(<BondsContainer application={application} />);

        expect(mocks.useBondEvents).toHaveBeenCalledWith(
            expect.objectContaining({ epochIndex: 3n, limit: 10, offset: 20 }),
        );
        expect(mocks.useBondEventSummary).toHaveBeenCalledWith({
            application,
            epochIndex: 3n,
            totalCount: 42,
        });
    });

    it("should ignore invalid url values", () => {
        mocks.useSearchParams.mockReturnValue(
            new ReadonlyURLSearchParams("epoch=abc&lv=7&offset=-1"),
        );

        render(<BondsContainer application={application} />);

        expect(mocks.useBondEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                epochIndex: undefined,
                limit: 50,
                offset: 0,
            }),
        );
    });

    it("should display an error when the events can not be fetched", () => {
        mocks.useSearchParams.mockReturnValue(new ReadonlyURLSearchParams());
        mocks.useBondEvents.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error("boom"),
        });

        render(<BondsContainer application={application} />);

        expect(
            screen.getByText(
                `Something went wrong while fetching the bond events for application ${application}`,
            ),
        ).toBeInTheDocument();
    });
});
