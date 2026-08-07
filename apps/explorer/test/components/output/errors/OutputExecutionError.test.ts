import { describe, expect, it } from "vitest";
import OutputExecutionError from "../../../../src/components/output/errors/OutputExecutionError";

describe("OutputExecutionError", () => {
    it("uses supplied simple error details", () => {
        const error = new OutputExecutionError({
            type: "error",
            message: "Execution reverted",
            shortMessage: "Denied",
        });

        expect(error.message).toBe("Execution reverted");
        expect(error.shortMessage).toBe("Denied");
    });

    it("uses the simple-error fallback short message", () => {
        const error = new OutputExecutionError({
            type: "error",
            message: "Execution reverted",
        });

        expect(error.message).toBe("Execution reverted");
        expect(error.shortMessage).toBe("Something is not right!");
    });

    it("extracts Wagmi error details when available", () => {
        const error = new OutputExecutionError({
            type: "wagmi-error",
            error: {
                shortMessage: "Simulation failed",
                cause: { data: { errorName: "Unauthorized" } },
            } as never,
        });

        expect(error.message).toBe("Simulation failed");
        expect(error.shortMessage).toBe("Unauthorized");
    });
});
