import { describe, expect, it } from "vitest";
import { BondPool } from "../../../src/components/bond/BondPool";
import type { BondPool as Pool } from "../../../src/lib/bondUtils";
import { render, screen } from "../../test-utils";

const pool: Pool = {
    deposited: 42_000_000_000_000_000n,
    exact: true,
    joins: 2,
    refunded: 3_000_000_000_000_000n,
    refunds: 14,
    paid: 0n,
    burned: 0n,
};

describe("BondPool", () => {
    it("should show the money in and out of the tournament", () => {
        render(
            <BondPool
                pool={pool}
                bondValue={21_000_000_000_000_000n}
                balance={39_000_000_000_000_000n}
            />,
        );

        expect(screen.getByText("0.021 ETH")).toBeInTheDocument();
        expect(screen.getByText("0.042 ETH")).toBeInTheDocument();
        expect(screen.getByText("2 joins")).toBeInTheDocument();
        expect(screen.getByText("− 0.003 ETH")).toBeInTheDocument();
        expect(screen.getByText("14 refunds")).toBeInTheDocument();
        expect(screen.getByText("0.039 ETH")).toBeInTheDocument();
        expect(
            screen.getByLabelText("Where the bonds went"),
        ).toBeInTheDocument();
    });

    it("should show a relayed deposit as a minimum", () => {
        render(
            <BondPool
                pool={{ ...pool, exact: false, joins: 1 }}
                balance={0n}
            />,
        );

        expect(screen.getByText("at least 0.042 ETH")).toBeInTheDocument();
        expect(screen.getByText("1 join")).toBeInTheDocument();
    });

    it("should show skeletons while the values load", () => {
        render(<BondPool pool={{ ...pool, exact: false }} loading />);

        expect(screen.queryByText("0.042 ETH")).not.toBeInTheDocument();
        expect(
            screen.queryByLabelText("Where the bonds went"),
        ).not.toBeInTheDocument();
        expect(screen.getByText("− 0.003 ETH")).toBeInTheDocument();
    });
});
