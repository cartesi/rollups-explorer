import type { Application } from "@cartesi/viem";
import { zeroHash } from "viem";
import { describe, expect, test } from "vitest";
import { isForeclosed } from "../../../src/components/application/utils";

const createApplication = (
    overrides?: Partial<
        Pick<Application, "forecloseBlock" | "forecloseTransaction">
    >,
) => {
    return {
        forecloseBlock: 0n,
        forecloseTransaction: zeroHash,
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
});
