import type { Application } from "@cartesi/client";
import { zeroHash } from "viem";
import { describe, expect, test } from "vitest";
import {
    isAccountsDriveProved,
    isForeclosed,
    isGuardian,
} from "../../../src/components/application/utils";

const createApplication = (
    overrides?: Partial<
        Pick<
            Application,
            | "accountsDriveProvedBlock"
            | "accountsDriveProvedTransaction"
            | "forecloseBlock"
            | "forecloseTransaction"
            | "withdrawalConfig"
        >
    >,
) => {
    return {
        accountsDriveProvedBlock: 0n,
        accountsDriveProvedTransaction: zeroHash,
        forecloseBlock: 0n,
        forecloseTransaction: zeroHash,
        withdrawalConfig: {
            guardian: "0x1234567890AbcdEF1234567890aBcdef12345678",
            log2LeavesPerAccount: 0n,
            log2MaxNumOfAccounts: 0n,
            accountsDriveStartIndex: 0n,
            withdrawalOutputBuilder:
                "0x0000000000000000000000000000000000000000",
        },
        ...overrides,
    } as Application;
};

describe("Application utils", () => {
    describe("isForeclosed", () => {
        test("should return false when foreclose block is zero even with a valid transaction", () => {
            const application = createApplication({
                forecloseBlock: 0n,
                forecloseTransaction:
                    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            });

            expect(isForeclosed(application)).toBe(false);
        });

        test("should return false when foreclose transaction is zero hash", () => {
            const application = createApplication({
                forecloseBlock: 1n,
                forecloseTransaction: zeroHash,
            });

            expect(isForeclosed(application)).toBe(false);
        });

        test("should return false when foreclose transaction is null", () => {
            const application = createApplication({
                forecloseBlock: 1n,
                // @ts-expect-error --- currently the api is returning null ---
                forecloseTransaction: null,
            });

            expect(isForeclosed(application)).toBe(false);
        });

        test("should return false when foreclose transaction is undefined", () => {
            const application = createApplication({
                forecloseBlock: 1n,
                forecloseTransaction: undefined,
            });

            expect(isForeclosed(application)).toEqual(false);
        });

        test("should return true when foreclose block is non-zero and transaction is valid", () => {
            const application = createApplication({
                forecloseBlock: 42n,
                forecloseTransaction:
                    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            });

            expect(isForeclosed(application)).toEqual(true);
        });
    });

    describe("isAccountsDriveProved", () => {
        test("should return false when proved block is zero even with a valid transaction", () => {
            const application = createApplication({
                accountsDriveProvedBlock: 0n,
                accountsDriveProvedTransaction:
                    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            });

            expect(isAccountsDriveProved(application)).toBe(false);
        });

        test("should return false when proved transaction is zero hash", () => {
            const application = createApplication({
                accountsDriveProvedBlock: 1n,
                accountsDriveProvedTransaction: zeroHash,
            });

            expect(isAccountsDriveProved(application)).toBe(false);
        });

        test("should return false when proved transaction is null", () => {
            const application = createApplication({
                accountsDriveProvedBlock: 1n,
                // @ts-expect-error --- currently the api is returning null ---
                accountsDriveProvedTransaction: null,
            });

            expect(isAccountsDriveProved(application)).toBe(false);
        });

        test("should return false when proved transaction is undefined", () => {
            const application = createApplication({
                accountsDriveProvedBlock: 1n,
                accountsDriveProvedTransaction: undefined,
            });

            expect(isAccountsDriveProved(application)).toBe(false);
        });

        test("should return true when proved block is non-zero and transaction is valid", () => {
            const application = createApplication({
                accountsDriveProvedBlock: 42n,
                accountsDriveProvedTransaction:
                    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            });

            expect(isAccountsDriveProved(application)).toBe(true);
        });
    });

    describe("isGuardian", () => {
        test("should return false when address is not provided", () => {
            expect(isGuardian(createApplication())).toBe(false);
        });

        test("should return false when withdrawal configuration is not set", () => {
            const application = createApplication({
                withdrawalConfig: {
                    guardian: "0x0000000000000000000000000000000000000000",
                    log2LeavesPerAccount: 0n,
                    log2MaxNumOfAccounts: 0n,
                    accountsDriveStartIndex: 0n,
                    withdrawalOutputBuilder:
                        "0x0000000000000000000000000000000000000000",
                },
            });

            expect(
                isGuardian(
                    application,
                    "0x0000000000000000000000000000000000000000",
                ),
            ).toBe(false);
        });

        test("should return true for the guardian regardless of address casing", () => {
            expect(
                isGuardian(
                    createApplication(),
                    "0x1234567890abcdef1234567890abcdef12345678",
                ),
            ).toBe(true);
        });

        test("should return false for an address different from the guardian", () => {
            expect(
                isGuardian(
                    createApplication(),
                    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                ),
            ).toBe(false);
        });
    });
});
