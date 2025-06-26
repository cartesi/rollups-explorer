import { describe, expect, it } from "vitest";
import { checkQuery, checkApplicationsQuery } from "../../src/lib/query";

describe("Lib query tests", () => {
    const address = "0x4ca2f6935200b9a782a78f408f640f17b29809d8" as const;
    const messageSender = "0x7cfb0193ca87eb6e48056885e026552c3a941fc4" as const;
    const txHash =
        "0x8cdd370a9e58e7490604b20545d5152d72d0c17808d1738d29da4468b558afd3" as const;
    const inputIndex = "10" as const;
    const validHex = "0x" as const;
    const chainId = "11155111" as const;
    const chainQ = { chain: { id_eq: chainId } };

    describe("checkQuery", () => {
        it("should return an only chain related query when input and application is not defined", () => {
            expect(checkQuery("", "", chainId)).toEqual({
                chain: { id_eq: chainId },
            });
        });

        describe("Application is defined", () => {
            const byAppId = {
                application: {
                    address_startsWith: address,
                    ...chainQ,
                },
            };

            it("should return query only by app id when input is not defined", () => {
                const result = checkQuery("", address, chainId);
                expect(result).toEqual(byAppId);
            });

            describe("with input defined", () => {
                it("should return AND operator including transaction hash", () => {
                    const result = checkQuery(txHash, address, chainId);
                    expect(result).toEqual({
                        AND: [
                            byAppId,
                            {
                                transactionHash_eq: txHash,
                                ...chainQ,
                            },
                        ],
                    });
                });

                it("should return AND operator including message-sender for valid hex", () => {
                    const result = checkQuery(messageSender, address, chainId);

                    expect(result).toEqual({
                        AND: [
                            byAppId,
                            {
                                msgSender_startsWith: messageSender,
                                ...chainQ,
                            },
                        ],
                    });

                    expect(checkQuery(validHex, address, chainId)).toEqual({
                        AND: [
                            byAppId,
                            { msgSender_startsWith: "0x", ...chainQ },
                        ],
                    });
                });

                it("should return AND operator including input-index for number", () => {
                    const result = checkQuery(inputIndex, address, chainId);
                    expect(result).toEqual({
                        AND: [byAppId, { index_eq: 10, ...chainQ }],
                    });
                });
            });
        });

        describe("When only input is defined", () => {
            it("should return query by transaction-hash for valid tx", () => {
                const result = checkQuery(txHash, "", chainId);
                expect(result).toEqual({
                    transactionHash_eq: txHash,
                    ...chainQ,
                });
            });

            it("should return OR operator for valid Hex value checking for msg-sender and application id", () => {
                const result = checkQuery(address, "", chainId);

                expect(result).toEqual({
                    OR: [
                        { msgSender_startsWith: address, ...chainQ },
                        {
                            application: { address_startsWith: address },
                            ...chainQ,
                        },
                    ],
                });

                expect(checkQuery(validHex, "", chainId)).toEqual({
                    OR: [
                        { msgSender_startsWith: validHex, ...chainQ },
                        {
                            application: {
                                address_startsWith: validHex,
                            },
                            ...chainQ,
                        },
                    ],
                });
            });

            it("should return query checking by index_eq for anything else", () => {
                expect(checkQuery(inputIndex, "", chainId)).toEqual({
                    ...chainQ,
                    index_eq: 10,
                });
                expect(checkQuery("hello", "", chainId)).toEqual({
                    index_eq: NaN,
                    ...chainQ,
                });
            });
        });
    });

    describe("checkApplicationsQuery", () => {
        it("should return an only chain related query when application is not defined", () => {
            expect(checkApplicationsQuery({ chainId })).toEqual({
                chain: { id_eq: chainId },
            });
        });

        it("should return chain and application related query when both chain id and application are defined", () => {
            expect(
                checkApplicationsQuery({
                    chainId,
                    address,
                }),
            ).toEqual({
                chain: { id_eq: chainId },
                address_startsWith: address,
                OR: [
                    {
                        owner_startsWith: address,
                    },
                ],
            });
        });
    });
});
