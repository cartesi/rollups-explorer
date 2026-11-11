import { describe, expect, test } from "vitest";
import { checkNodeVersion } from "../../src/lib/supportedRollupsNode";

describe("checkNodeVersion function", () => {
    test("should return supported for versions inside the configured range", () => {
        expect(checkNodeVersion("2.0.0-alpha.14")).toEqual({
            status: "supported",
        });
        expect(checkNodeVersion("2.0.0")).toEqual({ status: "supported" });
    });

    test("should return not-valid-semantic-versioning for invalid versions", () => {
        expect(checkNodeVersion("not-a-version")).toEqual({
            status: "not-valid-semantic-versioning",
            error: new Error("not-a-version is not a valid semantic version"),
        });
    });

    test("should return not-supported-version for older versions", () => {
        const result = checkNodeVersion("2.0.0-alpha.13");

        expect(result.status).toBe("not-supported-version");
        if (result.status === "not-supported-version") {
            expect(result.error.message).toBe(
                "The version 2.0.0-alpha.13 is older than minimal version (2.0.0-alpha.14)",
            );
            expect(result.extra.supportedRange).toContain("2.0.0-alpha.14");
        }
    });

    test("should return not-supported-version for newer major versions", () => {
        const version = "3.0.0";
        const result = checkNodeVersion(version);

        expect(result.status).toBe("not-supported-version");
        if (result.status === "not-supported-version") {
            expect(result.error.message).toBe(
                `The version ${version} is not supported yet`,
            );
            expect(result.extra.supportedRange).toBe(
                ">=2.0.0-alpha.14 <3.0.0-0",
            );
        }
    });
});
