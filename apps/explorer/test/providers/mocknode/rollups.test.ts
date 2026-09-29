import { decodeOutput } from "@cartesi/codec";
import type { EpochStatus } from "@cartesi/client";
import { describe, expect, it } from "vitest";
import { isForeclosed } from "../../../src/components/application/utils";
import { buildRollupsTimeline } from "../../../src/providers/mocknode/scenarios/rollups";
import { rollupsScenarios } from "../../../src/providers/mocknode/scenarios/specs";
import { viewRollupsApplication } from "../../../src/providers/mocknode/scenarios/view";

const time = (block: bigint) =>
    new Date(1_780_000_000_000 + Number(block) * 12_000);
const [authority, quorum, foreclosed] = rollupsScenarios.map((spec) =>
    buildRollupsTimeline(spec, 1_000n),
);

const statusesOver = (timeline: typeof authority) => {
    const seen = new Set<EpochStatus>();
    for (let head = timeline.anchor; head <= timeline.endsAt; head++) {
        viewRollupsApplication(timeline, { head, time }).epochs.forEach(
            (epoch) => seen.add(epoch.status),
        );
    }
    return seen;
};

describe("rollups scenario timelines", () => {
    it("should skip epochs without inputs and keep virtual indexes dense", () => {
        const { epochs } = viewRollupsApplication(authority, {
            head: authority.endsAt,
            time,
        });
        expect(epochs.map((epoch) => epoch.index)).toEqual([
            0n,
            1n,
            3n,
            4n,
            6n,
            7n,
            8n,
            9n,
        ]);
        expect(epochs.map((epoch) => epoch.virtualIndex)).toEqual([
            0n,
            1n,
            2n,
            3n,
            4n,
            5n,
            6n,
            7n,
        ]);
        epochs
            .slice(1)
            .forEach((epoch, index) =>
                expect(epoch.inputIndexLowerBound).toBe(
                    epochs[index].inputIndexUpperBound,
                ),
            );
    });

    it("should move epochs through every claim status", () => {
        expect(statusesOver(quorum)).toEqual(
            new Set([
                "OPEN",
                "CLOSED",
                "INPUTS_PROCESSED",
                "CLAIM_COMPUTED",
                "CLAIM_SUBMITTED",
                "CLAIM_STAGED",
                "CLAIM_ACCEPTED",
                "CLAIM_REJECTED",
            ]),
        );
        expect(statusesOver(foreclosed)).toContain("CLAIM_FORECLOSED");
    });

    it("should prove outputs once the claim is computed and execute them once accepted", () => {
        for (let head = quorum.anchor; head <= quorum.endsAt; head += 5n) {
            const data = viewRollupsApplication(quorum, { head, time });
            const epochs = new Map(
                data.epochs.map((epoch) => [epoch.index, epoch]),
            );
            data.outputs.forEach((output) => {
                const epoch = epochs.get(output.epochIndex);
                expect(output.outputHashesSiblings !== null).toBe(
                    epoch?.commitment !== null,
                );
                if (output.executionTransactionHash) {
                    expect(epoch?.status).toBe("CLAIM_ACCEPTED");
                    expect(output.decodedData?.type).not.toBe("Notice");
                }
                expect(decodeOutput(output.rawData).type).toBe(
                    output.decodedData?.type,
                );
            });
        }
        const last = viewRollupsApplication(quorum, {
            head: quorum.endsAt,
            time,
        });
        const executable = last.outputs.filter(
            (output) => output.decodedData?.type !== "Notice",
        );
        expect(
            executable.some((output) => output.executionTransactionHash),
        ).toBe(true);
        expect(
            executable.some((output) => !output.executionTransactionHash),
        ).toBe(true);
    });

    it("should report input outcomes and portal deposits", () => {
        const { inputs, reports } = viewRollupsApplication(authority, {
            head: authority.endsAt,
            time,
        });
        expect(new Set(inputs.map((input) => input.status))).toEqual(
            new Set(["ACCEPTED", "REJECTED", "EXCEPTION"]),
        );
        expect(
            inputs.find((input) => input.status === "EXCEPTION")?.exceptionData,
        ).not.toBeNull();
        expect(reports.length).toBeGreaterThan(0);
    });

    it("should foreclose and let depositors withdraw their accounts", () => {
        const before = viewRollupsApplication(foreclosed, {
            head: (foreclosed.foreclosure?.tx.block ?? 0n) - 1n,
            time,
        });
        expect(isForeclosed(before.application)).toBe(false);
        const after = viewRollupsApplication(foreclosed, {
            head: foreclosed.endsAt,
            time,
        });
        expect(isForeclosed(after.application)).toBe(true);
        expect(after.application.accountsDriveProvedBlock).toBeGreaterThan(
            after.application.forecloseBlock,
        );
        expect(after.withdrawals.length).toBeGreaterThan(1);
        after.withdrawals.forEach((withdrawal) =>
            expect(decodeOutput(withdrawal.output).type).toBe(
                "DelegateCallVoucher",
            ),
        );
        expect(after.epochs[after.epochs.length - 1].status).toBe(
            "CLAIM_FORECLOSED",
        );
    });
});
