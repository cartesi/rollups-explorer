import { describe, expect, test } from "vitest";
import { databaseName } from "../../src/lib/db";

describe("database configuration", () => {
    test("should match the expected value", () => {
        expect(databaseName).toBe("cartesi_rollups_explorer");
    });
});
