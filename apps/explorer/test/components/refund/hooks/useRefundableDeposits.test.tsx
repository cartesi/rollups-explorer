import {
    erc1155BatchPortalAddress,
    erc1155SinglePortalAddress,
    erc20PortalAddress,
    erc721PortalAddress,
    etherPortalAddress,
    useEpochs,
    useInputs,
} from "@cartesi/react";
import { renderHook } from "@testing-library/react";
import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRefundAssets } from "../../../../src/components/refund/hooks/useRefundAssets";
import { useRefundStatuses } from "../../../../src/components/refund/hooks/useRefundStatus";
import { useRefundableDeposits } from "../../../../src/components/refund/hooks/useRefundableDeposits";
import { createDepositInput } from "../../../../src/stories/deposits";
import {
    erc1155BatchDepositInput,
    erc20DepositInput,
    etherDepositInput,
    refundEpochs,
} from "../../../../src/stories/refunds";
import { createApplication } from "../../../test-utils";

vi.mock("@cartesi/react", async () => {
    const actual = await vi.importActual("@cartesi/react");
    return { ...actual, useEpochs: vi.fn(), useInputs: vi.fn() };
});

vi.mock("../../../../src/components/refund/hooks/useRefundStatus", () => ({
    useRefundStatuses: vi.fn(),
}));

vi.mock("../../../../src/components/refund/hooks/useRefundAssets", () => ({
    useRefundAssets: vi.fn(),
}));

const mockEpochs = vi.mocked(useEpochs);
const mockInputs = vi.mocked(useInputs);
const mockStatuses = vi.mocked(useRefundStatuses);
const mockAssets = vi.mocked(useRefundAssets);

const foreclosed = createApplication({
    applicationAddress: "0x40a7C73a6a592D8697bE97254E273E6f3FB46000",
    forecloseBlock: 15498n,
    forecloseTransaction:
        "0x0000000000000000000000000000000000000000000000000000000000000012",
});
const acceptedEpochDeposit = createDepositInput({ index: 0n, epochIndex: 51n });
const refetch = vi.fn();
const portals: Address[] = [
    etherPortalAddress,
    erc20PortalAddress,
    erc721PortalAddress,
    erc1155SinglePortalAddress,
    erc1155BatchPortalAddress,
];

// Stable results per sender, as react-query keeps `data` referentially
// stable across renders.
const inputsBySender = (
    bySender: Partial<Record<Address, unknown[]>>,
    loading: Address[] = [],
) => {
    const results = new Map(
        portals.map((sender) => [
            sender,
            {
                data: { data: bySender[sender] ?? [] },
                isLoading: loading.includes(sender),
            },
        ]),
    );
    mockInputs.mockImplementation(
        ({ sender }) => results.get(sender as Address) as never,
    );
};

describe("useRefundableDeposits", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockEpochs.mockReturnValue({
            data: { data: [refundEpochs[0]] },
            isLoading: false,
        } as never);
        inputsBySender({
            [etherPortalAddress]: [etherDepositInput, acceptedEpochDeposit],
            [erc20PortalAddress]: [erc20DepositInput],
            [erc1155BatchPortalAddress]: [erc1155BatchDepositInput],
        });
        mockStatuses.mockReturnValue({
            byIndex: new Map([
                [3n, false],
                [2n, true],
            ]),
            failed: new Set(),
            isLoading: false,
            error: null,
            refetch,
        });
        mockAssets.mockImplementation((assets) =>
            assets.map((asset) =>
                asset.kind === "erc20"
                    ? { ...asset, symbol: "USDC", decimals: 6 }
                    : asset,
            ),
        );
    });

    it("should query nothing for an application that is not foreclosed", () => {
        const { result } = renderHook(() =>
            useRefundableDeposits(createApplication()),
        );

        expect(result.current.deposits).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(mockEpochs).toHaveBeenCalledWith(
            expect.objectContaining({ enabled: false }),
        );
        expect(mockInputs).toHaveBeenCalledTimes(5);
        expect(mockInputs).toHaveBeenCalledWith(
            expect.objectContaining({ enabled: false }),
        );
        expect(mockAssets).toHaveBeenCalledWith([], { enabled: false });
    });

    it("should fetch the newest deposits of every portal", () => {
        renderHook(() => useRefundableDeposits(foreclosed));

        expect(mockEpochs).toHaveBeenCalledWith(
            expect.objectContaining({
                application: foreclosed.applicationAddress,
                status: expect.not.arrayContaining(["CLAIM_ACCEPTED"]),
                descending: true,
                enabled: true,
            }),
        );
        for (const sender of portals) {
            expect(mockInputs).toHaveBeenCalledWith({
                application: foreclosed.applicationAddress,
                sender,
                from: refundEpochs[0].inputIndexLowerBound,
                descending: true,
                limit: 3,
                enabled: true,
            });
        }
    });

    it("should merge the portals newest first, drop accepted epochs and add status and metadata", () => {
        const { result } = renderHook(() => useRefundableDeposits(foreclosed));

        expect(mockStatuses).toHaveBeenCalledWith(
            foreclosed.applicationAddress,
            [3n, 2n, 1n],
            { enabled: true },
        );
        expect(
            result.current.deposits.map(({ input, asset, status }) => [
                input.index,
                asset.kind,
                "symbol" in asset ? asset.symbol : undefined,
                status,
            ]),
        ).toEqual([
            [3n, "ether", undefined, "refundable"],
            [2n, "erc20", "USDC", "refunded"],
            [1n, "erc1155-batch", undefined, "unknown"],
        ]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.refetch).toBe(refetch);
    });

    it("should mark a deposit whose flag could not be read as unavailable", () => {
        mockStatuses.mockReturnValue({
            byIndex: new Map([[3n, false]]),
            failed: new Set([2n]),
            isLoading: false,
            error: null,
            refetch,
        });

        const { result } = renderHook(() => useRefundableDeposits(foreclosed));

        expect(result.current.deposits.map(({ status }) => status)).toEqual([
            "refundable",
            "unavailable",
            "unknown",
        ]);
    });

    it("should keep only the newest deposits up to the limit", () => {
        const { result } = renderHook(() =>
            useRefundableDeposits(foreclosed, { limit: 2 }),
        );

        expect(result.current.deposits.map(({ input }) => input.index)).toEqual(
            [3n, 2n],
        );
        expect(mockInputs).toHaveBeenCalledWith(
            expect.objectContaining({ limit: 2 }),
        );
    });

    it("should not list inputs before the epochs are known", () => {
        mockEpochs.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as never);

        const { result } = renderHook(() => useRefundableDeposits(foreclosed));

        expect(mockInputs).toHaveBeenCalledWith(
            expect.objectContaining({ from: undefined, enabled: false }),
        );
        expect(result.current.isLoading).toBe(true);
    });

    it("should be loading while any portal query is loading", () => {
        inputsBySender({}, [erc721PortalAddress]);

        const { result } = renderHook(() => useRefundableDeposits(foreclosed));

        expect(result.current.isLoading).toBe(true);
    });

    it("should reuse the decoded deposits across unrelated renders", () => {
        const { rerender } = renderHook(() =>
            useRefundableDeposits(foreclosed),
        );

        rerender();

        const [first, second] = mockAssets.mock.calls.map(([assets]) => assets);
        expect(second).toBe(first);
        expect(first).toHaveLength(3);
    });
});
