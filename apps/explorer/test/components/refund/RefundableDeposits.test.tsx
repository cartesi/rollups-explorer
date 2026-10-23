import { beforeEach, describe, expect, it, vi } from "vitest";
import { useConfig } from "wagmi";
import { foundry } from "wagmi/chains";
import { RefundableDeposits } from "../../../src/components/refund/RefundableDeposits";
import { refundableDeposits } from "../../../src/stories/refunds";
import { createApplication, render, screen } from "../../test-utils";

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return { ...actual, useConfig: vi.fn() };
});

const useConfigMock = vi.mocked(useConfig, { partial: true });
const application = createApplication({ name: "aeron" });

describe("RefundableDeposits", () => {
    beforeEach(() => {
        useConfigMock.mockReturnValue({ chains: [foundry] });
    });

    it("should render nothing without deposits", () => {
        render(<RefundableDeposits application={application} deposits={[]} />);

        expect(
            screen.queryByText("Refundable deposits"),
        ).not.toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("should list the deposits with their asset, epoch and status", () => {
        render(
            <RefundableDeposits
                application={application}
                deposits={refundableDeposits}
            />,
        );

        expect(screen.getByText("Refundable deposits")).toBeInTheDocument();
        expect(screen.getByText("# 3")).toBeInTheDocument();
        expect(screen.getByText("1.5 ETH")).toBeInTheDocument();
        expect(screen.getByText("250 USDC")).toBeInTheDocument();
        expect(screen.getByText("2 token ids of GAME")).toBeInTheDocument();
        expect(screen.getAllByText("Refundable")).toHaveLength(2);
        expect(screen.getByText("Deposit refunded")).toBeInTheDocument();
    });

    it("should link each deposit to its epoch page", () => {
        render(
            <RefundableDeposits
                application={application}
                deposits={refundableDeposits}
            />,
        );

        const links = screen.getAllByRole("link", { name: "# 52" });

        expect(links).toHaveLength(3);
        expect(links[0]).toHaveAttribute("href", "/apps/aeron/epochs/52");
    });

    it("should show at most the given number of deposits", () => {
        render(
            <RefundableDeposits
                application={application}
                deposits={refundableDeposits}
                limit={2}
            />,
        );

        expect(screen.getAllByRole("link", { name: "# 52" })).toHaveLength(2);
        expect(
            screen.queryByText("2 token ids of GAME"),
        ).not.toBeInTheDocument();
    });
});
