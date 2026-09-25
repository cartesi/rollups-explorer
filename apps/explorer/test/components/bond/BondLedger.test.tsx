import { foundry } from "viem/chains";
import { describe, expect, it, vi } from "vitest";
import { BondLedger } from "../../../src/components/bond/BondLedger";
import { createBondEvent } from "../../../src/stories/prt";
import { render, screen } from "../../test-utils";

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return { ...actual, useConfig: () => ({ chains: [foundry] }) };
});

const recipient = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const refunds = Array.from({ length: 12 }, (_, i) =>
    createBondEvent({
        blockNumber: BigInt(i + 1),
        logIndex: BigInt(i),
        refund: {
            recipient,
            value: 1_000_000_000_000_000n,
            success: i !== 0,
        },
    }),
);

describe("BondLedger", () => {
    it("should show the totals of every event", () => {
        render(<BondLedger events={refunds} />);

        expect(screen.getByText("0.011 ETH")).toBeInTheDocument();
        expect(screen.getByText("not paid (1)")).toBeInTheDocument();
    });

    it("should paginate the events", () => {
        render(<BondLedger events={refunds} pageSize={5} />);

        expect(screen.getAllByRole("row")).toHaveLength(6);
        expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
    });

    it("should mark refunds that were not paid", () => {
        render(<BondLedger events={refunds.slice(0, 1)} />);

        expect(screen.getByText("gas refund not paid")).toBeInTheDocument();
    });

    it("should explain each gas refund", () => {
        render(<BondLedger events={refunds.slice(0, 2)} />);

        expect(
            screen.getAllByLabelText(/Paid from the tournament's pooled bonds/),
        ).toHaveLength(2);
    });

    it("should tell when there are no bond events", () => {
        render(<BondLedger events={[]} />);

        expect(screen.getByText("No bond events")).toBeInTheDocument();
    });
});
