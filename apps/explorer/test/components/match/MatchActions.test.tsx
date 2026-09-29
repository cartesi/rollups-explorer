import { describe, expect, it } from "vitest";
import { MatchActions } from "../../../src/components/match/MatchActions";
import type { PartialBondRefundEvent } from "../../../src/lib/bondUtils";
import {
    createBisection,
    createBondEvent,
    createMatch,
    createMatchAdvanced,
    createMatchSnapshot,
    createTournament,
} from "../../../src/stories/prt";
import { render, screen } from "../../test-utils";

const tournament = createTournament({ height: 5n });

describe("MatchActions", () => {
    it("should list every advance against the total bisections", () => {
        const advances = [
            createMatchAdvanced({ segmentStartPosition: 16n, logIndex: 1n }),
            createMatchAdvanced({ segmentStartPosition: 16n, logIndex: 2n }),
        ];
        const match = createMatch({
            snapshot: createMatchSnapshot({
                phase: "BISECTING",
                bisection: { ...createBisection(), currentHeight: 3n },
                sealed: null,
            }),
        });

        render(
            <MatchActions
                advances={advances}
                match={match}
                now={Date.now()}
                tournament={tournament}
            />,
        );

        expect(screen.getByText("1 / 4")).toBeInTheDocument();
        expect(screen.getByText("2 / 4")).toBeInTheDocument();
        expect(
            screen.getAllByRole("progressbar")[0].getAttribute("aria-valuenow"),
        ).toBe("50");
    });

    it("should show both claims eliminated after a timeout without winner", () => {
        render(
            <MatchActions
                advances={[]}
                match={createMatch({ deletionReason: "TIMEOUT" })}
                now={Date.now()}
                tournament={tournament}
            />,
        );

        expect(screen.getByText("both claims eliminated")).toBeInTheDocument();
    });

    it("should show the timeout winner", () => {
        render(
            <MatchActions
                advances={[]}
                match={createMatch({
                    deletionReason: "TIMEOUT",
                    winnerCommitment: "TWO",
                })}
                now={Date.now()}
                tournament={tournament}
            />,
        );

        expect(screen.getByText("(by timeout)")).toBeInTheDocument();
    });

    it("should show a placeholder while the block timestamps load", () => {
        render(
            <MatchActions
                advances={[createMatchAdvanced({ blockNumber: 5n })]}
                match={createMatch()}
                now={Date.now()}
                timestamps={new Map()}
                timestampsLoading
                tournament={tournament}
            />,
        );

        expect(screen.getByTestId("timestamp-loading")).toBeInTheDocument();
    });

    it("should leave no time placeholder when timestamps are unavailable", () => {
        render(
            <MatchActions
                advances={[createMatchAdvanced({ blockNumber: 5n })]}
                match={createMatch()}
                now={Date.now()}
                timestamps={new Map()}
                tournament={tournament}
            />,
        );

        expect(
            screen.queryByTestId("timestamp-loading"),
        ).not.toBeInTheDocument();
        expect(screen.getByText("1 / 4")).toBeInTheDocument();
    });

    it("should show the relative time once the timestamp is known", () => {
        const now = Date.now();
        render(
            <MatchActions
                advances={[createMatchAdvanced({ blockNumber: 5n })]}
                match={createMatch()}
                now={now}
                timestamps={new Map([[5n, now - 60_000]])}
                tournament={tournament}
            />,
        );

        expect(screen.getByText("1 minute ago")).toBeInTheDocument();
    });

    it("should attach the refunds paid in the same transactions", () => {
        const advanceTx =
            "0x1111111111111111111111111111111111111111111111111111111111111111";
        const closingTx =
            "0x2222222222222222222222222222222222222222222222222222222222222222";
        const refundOf = (txHash: `0x${string}`, value: bigint) =>
            createBondEvent({
                txHash,
                refund: {
                    recipient: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    value,
                    success: true,
                },
            }) as PartialBondRefundEvent;

        render(
            <MatchActions
                advances={[createMatchAdvanced({ txHash: advanceTx })]}
                match={createMatch({
                    deletionReason: "STEP",
                    deletionTxHash: closingTx,
                    winnerCommitment: "ONE",
                })}
                now={Date.now()}
                refunds={
                    new Map([
                        [
                            advanceTx,
                            refundOf(advanceTx, 1_000_000_000_000_000n),
                        ],
                        [
                            closingTx,
                            refundOf(closingTx, 2_000_000_000_000_000n),
                        ],
                    ])
                }
                tournament={tournament}
            />,
        );

        expect(
            screen.getByText("gas refunded 0.001 ETH to"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Match closing gas refund"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("gas refunded 0.002 ETH to"),
        ).toBeInTheDocument();
    });
});
