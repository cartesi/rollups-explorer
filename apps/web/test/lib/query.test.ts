import { describe, expect, it } from "vitest";
import { checkQuery } from "../../src/lib/query";

describe("Lib query tests", () => {
    const address = "0x4ca2f6935200b9a782a78f408f640f17b29809d8" as const;
    const messageSender = "0x7cfb0193ca87eb6e48056885e026552c3a941fc4" as const;
    const txHash =
        "0x8cdd370a9e58e7490604b20545d5152d72d0c17808d1738d29da4468b558afd3" as const;
    const inputIndex = "10" as const;
    const validHex = "0x" as const;

    it("should return an empty object when input and application is not defined", () => {
        expect(checkQuery("", "")).toEqual({});
    });

    describe("Application is defined", () => {
        const byAppId = { application: { id_startsWith: address } };
        it("should return query only by app id when input is not defined", () => {
            const result = checkQuery("", address);
            expect(result).toEqual(byAppId);
        });

        describe("with input defined", () => {
            it("should return AND operator including transaction hash", () => {
                const result = checkQuery(txHash, address);
                expect(result).toEqual({
                    AND: [byAppId, { transactionHash_eq: txHash }],
                });
            });

            it("should return AND operator including message-sender for valid hex", () => {
                const result = checkQuery(messageSender, address);
                expect(result).toEqual({
                    AND: [byAppId, { msgSender_startsWith: messageSender }],
                });

                expect(checkQuery(validHex, address)).toEqual({
                    AND: [byAppId, { msgSender_startsWith: "0x" }],
                });
            });

            it("should return AND operator including input-index for number", () => {
                const result = checkQuery(inputIndex, address);
                expect(result).toEqual({ AND: [byAppId, { index_eq: 10 }] });
            });
        });
    });

    describe("When only input is defined", () => {
        it("should return query by transaction-hash for valid tx", () => {
            const result = checkQuery(txHash, "");
            expect(result).toEqual({ transactionHash_eq: txHash });
        });

        it("should return OR operator for valid Hex value checking for msg-sender and application id", () => {
            const result = checkQuery(address, "");
            expect(result).toEqual({
                OR: [
                    { msgSender_startsWith: address },
                    { application: { id_startsWith: address } },
                ],
            });

            expect(checkQuery(validHex, "")).toEqual({
                OR: [
                    { msgSender_startsWith: validHex },
                    { application: { id_startsWith: validHex } },
                ],
            });
        });

        it("should return query checking by index_eq for anything else", () => {
            expect(checkQuery(inputIndex, "")).toEqual({ index_eq: 10 });
            expect(checkQuery("hello", "")).toEqual({ index_eq: NaN });
        });
    });
});
