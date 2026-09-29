import { decodeInput, decodeOutput } from "@cartesi/codec";
import { keccak256 } from "viem";
import { describe, expect, it } from "vitest";
import {
    createInput,
    createOutput,
    createWithdrawal,
    encodeAccount,
} from "../../src/stories/rollups";

describe("rollups fixture builders", () => {
    it("encodes the input raw data from its decoded data", () => {
        const input = createInput({ index: 3n, blockNumber: 40n });
        const decoded = decodeInput(input.rawData);
        expect(decoded.index).toBe(3n);
        expect(decoded.blockNumber).toBe(40n);
        expect(decoded.msgSender).toBe(input.decodedData?.sender);
    });

    it("encodes the output raw data and hash from its decoded data", () => {
        const output = createOutput({
            decodedData: {
                type: "Voucher",
                destination: "0x86EA17052C8e335Ad830B54EF566274EAB46B852",
                value: 10n,
                payload: "0x",
            },
        });
        expect(decodeOutput(output.rawData).type).toBe("Voucher");
        expect(output.hash).toBe(keccak256(output.rawData));
    });

    it("encodes an accounts drive leaf with a little-endian balance", () => {
        expect(
            encodeAccount(
                "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                300_000n,
            ).toLowerCase(),
        ).toBe(
            "0xe093040000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000",
        );
    });

    it("builds a withdrawal as an executable delegate call voucher", () => {
        expect(decodeOutput(createWithdrawal().output).type).toBe(
            "DelegateCallVoucher",
        );
    });
});
