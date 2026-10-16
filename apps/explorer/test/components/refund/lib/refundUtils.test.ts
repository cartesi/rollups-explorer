import { parseUnits } from "viem";
import { describe, expect, it } from "vitest";
import {
    decodeDepositInput,
    formatRefundAsset,
    isRefundableEpoch,
    refundErrorMessage,
    refundStatusFromRead,
    toRefundAsset,
    type RefundAsset,
} from "../../../../src/components/refund/lib/refundUtils";
import {
    createDepositInput,
    depositor,
    token,
} from "../../../../src/stories/deposits";

describe("refundUtils", () => {
    describe("decodeDepositInput", () => {
        it("should decode an Ether deposit", () => {
            const input = createDepositInput({ value: parseUnits("1.5", 18) });

            const deposit = decodeDepositInput(input);

            expect(deposit?.type).toBe("EtherDeposit");
            expect(deposit?.sender).toBe(depositor);
            expect(deposit).toMatchObject({ value: parseUnits("1.5", 18) });
        });

        it.each([
            ["erc20", "Erc20Deposit"],
            ["erc721", "Erc721Deposit"],
            ["erc1155", "Erc1155SingleDeposit"],
            ["erc1155-batch", "Erc1155BatchDeposit"],
        ] as const)("should decode an %s deposit", (kind, type) => {
            const deposit = decodeDepositInput(createDepositInput({ kind }));

            expect(deposit?.type).toBe(type);
            expect(deposit).toMatchObject({ token, sender: depositor });
        });

        it("should return undefined for an input not sent by a portal", () => {
            const input = createDepositInput();
            input.decodedData!.sender = depositor;

            expect(decodeDepositInput(input)).toBeUndefined();
        });

        it("should return undefined for a malformed deposit payload", () => {
            const input = createDepositInput();
            input.decodedData!.payload = "0x1234";

            expect(decodeDepositInput(input)).toBeUndefined();
        });

        it("should return undefined when the input has no decoded data", () => {
            expect(decodeDepositInput({ decodedData: null })).toBeUndefined();
        });
    });

    describe("toRefundAsset", () => {
        it("should map an ERC-1155 batch to token id items", () => {
            const deposit = decodeDepositInput(
                createDepositInput({
                    kind: "erc1155-batch",
                    tokenIds: [7n, 9n],
                    values: [3n, 1n],
                }),
            )!;

            expect(toRefundAsset(deposit)).toEqual({
                kind: "erc1155-batch",
                depositor,
                token,
                items: [
                    { tokenId: 7n, value: 3n },
                    { tokenId: 9n, value: 1n },
                ],
            });
        });
    });

    describe("formatRefundAsset", () => {
        const cases: [string, RefundAsset, string][] = [
            [
                "ether",
                { kind: "ether", depositor, value: parseUnits("1.5", 18) },
                "1.5 ETH",
            ],
            [
                "erc20 with metadata",
                {
                    kind: "erc20",
                    depositor,
                    token,
                    value: parseUnits("1.5", 6),
                    symbol: "USDC",
                    decimals: 6,
                },
                "1.5 USDC",
            ],
            [
                "erc20 without metadata",
                { kind: "erc20", depositor, token, value: 1500000n },
                "1500000 units of 0x59b670...70857b",
            ],
            [
                "erc721 with symbol",
                {
                    kind: "erc721",
                    depositor,
                    token,
                    tokenId: 7n,
                    symbol: "BAYC",
                },
                "BAYC #7",
            ],
            [
                "erc721 without symbol",
                { kind: "erc721", depositor, token, tokenId: 7n },
                "token #7 of 0x59b670...70857b",
            ],
            [
                "erc1155",
                {
                    kind: "erc1155",
                    depositor,
                    token,
                    tokenId: 7n,
                    value: 3n,
                    symbol: "GAME",
                },
                "3 × #7 of GAME",
            ],
            [
                "erc1155 batch",
                {
                    kind: "erc1155-batch",
                    depositor,
                    token,
                    symbol: "GAME",
                    items: [
                        { tokenId: 7n, value: 3n },
                        { tokenId: 9n, value: 1n },
                    ],
                },
                "2 token ids of GAME",
            ],
        ];

        it.each(cases)("should format %s", (_, asset, expected) => {
            expect(formatRefundAsset(asset)).toBe(expected);
        });
    });

    describe("isRefundableEpoch", () => {
        it("should not refund an accepted epoch", () => {
            expect(isRefundableEpoch("CLAIM_ACCEPTED")).toBe(false);
        });

        it.each(["OPEN", "CLAIM_REJECTED", "CLAIM_FORECLOSED"] as const)(
            "should refund a %s epoch",
            (status) => {
                expect(isRefundableEpoch(status)).toBe(true);
            },
        );
    });

    describe("refundStatusFromRead", () => {
        it.each([
            [undefined, "unknown"],
            [true, "refunded"],
            [false, "refundable"],
        ] as const)("should map %s to %s", (read, status) => {
            expect(refundStatusFromRead(read)).toBe(status);
        });
    });

    describe("refundErrorMessage", () => {
        it("should use the copy of a known revert", () => {
            expect(
                refundErrorMessage({ revertName: "RefundAlreadyIssued" }),
            ).toBe("A refund was already issued for this deposit.");
        });

        it("should prefix a reason bubbled up from a token", () => {
            expect(
                refundErrorMessage({
                    reason: "ERC20: transfer amount exceeds balance",
                }),
            ).toBe(
                "The token contract rejected the transfer: ERC20: transfer amount exceeds balance",
            );
        });

        it("should fall back to the generic copy", () => {
            expect(refundErrorMessage({ revertName: "NotForeclosed" })).toBe(
                "The refund could not be sent.",
            );
            expect(refundErrorMessage()).toBe("The refund could not be sent.");
        });
    });
});
