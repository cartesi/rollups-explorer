import { iTournamentAbi } from "@cartesi/client/abi";
import { renderHook } from "@testing-library/react";
import { encodeFunctionData, keccak256, toHex } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTransaction } from "wagmi";
import { useLeafStepProof } from "../../src/hooks/useLeafStepProof";
import { createMatch } from "../../src/stories/prt";

vi.mock("wagmi", () => ({ useTransaction: vi.fn() }));

const mockUseTransaction = vi.mocked(useTransaction, { partial: true });

const deletionTxHash = keccak256(toHex("win"));
const stepMatch = createMatch({
    deletionReason: "STEP",
    winnerCommitment: "ONE",
    deletionTxHash,
});
const proof = "0xdeadbeef";

const winLeafMatchInput = encodeFunctionData({
    abi: iTournamentAbi,
    functionName: "winLeafMatch",
    args: [
        {
            commitmentOne: stepMatch.commitmentOne,
            commitmentTwo: stepMatch.commitmentTwo,
        },
        keccak256(toHex("left")),
        keccak256(toHex("right")),
        proof,
    ],
});

describe("useLeafStepProof", () => {
    beforeEach(() => {
        mockUseTransaction.mockReset();
    });

    it("should read the proof from the winLeafMatch call", () => {
        mockUseTransaction.mockReturnValue({
            data: { input: winLeafMatchInput },
        } as never);

        const { result } = renderHook(() => useLeafStepProof(stepMatch));

        expect(result.current).toBe(proof);
        expect(mockUseTransaction).toHaveBeenCalledWith({
            hash: deletionTxHash,
            query: { enabled: true, staleTime: Infinity },
        });
    });

    it("should report an unavailable proof for another call", () => {
        mockUseTransaction.mockReturnValue({
            data: {
                input: encodeFunctionData({
                    abi: iTournamentAbi,
                    functionName: "tryRecoveringBond",
                }),
            },
        } as never);

        expect(
            renderHook(() => useLeafStepProof(stepMatch)).result.current,
        ).toBeNull();
    });

    it("should report an unavailable proof for undecodable calldata", () => {
        mockUseTransaction.mockReturnValue({
            data: { input: "0x12345678" },
        } as never);

        expect(
            renderHook(() => useLeafStepProof(stepMatch)).result.current,
        ).toBeNull();
    });

    it("should not fetch for matches not won by a step", () => {
        mockUseTransaction.mockReturnValue({ data: undefined } as never);

        const { result } = renderHook(() =>
            useLeafStepProof(
                createMatch({
                    deletionReason: "CHILD_TOURNAMENT",
                    winnerCommitment: "ONE",
                    deletionTxHash,
                }),
            ),
        );

        expect(result.current).toBeUndefined();
        expect(mockUseTransaction).toHaveBeenCalledWith({
            hash: undefined,
            query: { enabled: false, staleTime: Infinity },
        });
    });
});
