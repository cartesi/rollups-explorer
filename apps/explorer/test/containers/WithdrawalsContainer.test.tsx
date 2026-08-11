import type { Application, Pagination } from "@cartesi/client";
import { ReadonlyURLSearchParams } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WithdrawalsContainer } from "../../src/containers/WithdrawalsContainer";
import {
    createApplication,
    createWithdrawal,
    render,
    screen,
} from "../test-utils";

const mocks = vi.hoisted(() => ({
    replace: vi.fn(),
    push: vi.fn(),
    useApplication: vi.fn(),
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
    useWithdrawals: vi.fn(),
}));

vi.mock("@cartesi/react", () => ({
    useApplication: mocks.useApplication,
    useWithdrawals: mocks.useWithdrawals,
}));

vi.mock("next/navigation", async (importOriginal) => ({
    ...(await importOriginal<typeof import("next/navigation")>()),
    useRouter: mocks.useRouter,
    useSearchParams: mocks.useSearchParams,
}));

vi.mock("../../src/page/WithdrawalsPage", () => ({
    WithdrawalsPage: ({ pagination }: { pagination: Pagination }) => (
        <div data-testid="withdrawals-page">
            {pagination.offset}/{pagination.limit}/{pagination.totalCount}
        </div>
    ),
}));

const applicationAddress = "0x1234567890abcdef1234567890abcdef12345678";
const forecloseTransaction =
    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const createForeclosedApplication = () =>
    createApplication({
        applicationAddress,
        forecloseBlock: 1n,
        forecloseTransaction,
    });

const setup = ({
    application = createForeclosedApplication(),
    applicationError = null,
    withdrawalError = null,
    searchParams = "",
}: {
    application?: Application | undefined;
    applicationError?: Error | null;
    withdrawalError?: Error | null;
    searchParams?: string;
} = {}) => {
    mocks.useRouter.mockReturnValue({
        push: mocks.push,
        replace: mocks.replace,
    });
    mocks.useSearchParams.mockReturnValue(
        new URLSearchParams(searchParams) as ReadonlyURLSearchParams,
    );
    mocks.useApplication.mockReturnValue({
        data: application,
        isLoading: false,
        error: applicationError,
    });
    mocks.useWithdrawals.mockReturnValue({
        data: {
            data: [createWithdrawal()],
            pagination: { offset: 0, limit: 50, totalCount: 1 },
        },
        isLoading: false,
        error: withdrawalError,
    });
};

describe("WithdrawalsContainer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("forwards validated URL query parameters to the withdrawal query", () => {
        setup({ searchParams: "ai=7&sv=asc&lv=30&offset=30" });

        render(<WithdrawalsContainer application={applicationAddress} />);

        expect(mocks.useWithdrawals).toHaveBeenCalledWith({
            application: applicationAddress,
            accountIndex: 7n,
            limit: 30,
            offset: 30,
            descending: false,
            enabled: true,
        });
        expect(screen.getByTestId("withdrawals-page")).toBeVisible();
    });

    it("redirects and disables withdrawal fetching when the application is not foreclosed", () => {
        setup({ application: createApplication({ applicationAddress }) });

        render(<WithdrawalsContainer application={applicationAddress} />);

        expect(mocks.replace).toHaveBeenCalledWith(
            `/apps/${applicationAddress}`,
        );
        expect(mocks.useWithdrawals).toHaveBeenCalledWith(
            expect.objectContaining({ enabled: false }),
        );
    });

    it("keeps the last pagination result while withdrawals are refreshing", () => {
        setup();
        const { rerender } = render(
            <WithdrawalsContainer application={applicationAddress} />,
        );
        expect(screen.getByTestId("withdrawals-page")).toHaveTextContent(
            "0/50/1",
        );

        mocks.useWithdrawals.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        });
        rerender(<WithdrawalsContainer application={applicationAddress} />);

        expect(screen.getByTestId("withdrawals-page")).toHaveTextContent(
            "0/50/1",
        );
    });

    it("shows application and withdrawal data errors", () => {
        setup({ applicationError: new Error("Application unavailable") });
        const { rerender } = render(
            <WithdrawalsContainer application={applicationAddress} />,
        );
        expect(
            screen.getByText(
                `Something went wrong while fetching data for application ${applicationAddress}`,
            ),
        ).toBeVisible();

        setup({ withdrawalError: new Error("Withdrawals unavailable") });
        rerender(<WithdrawalsContainer application={applicationAddress} />);
        expect(
            screen.getByText(
                `Something went wrong while fetching withdrawals for application ${applicationAddress}`,
            ),
        ).toBeVisible();
    });
});
