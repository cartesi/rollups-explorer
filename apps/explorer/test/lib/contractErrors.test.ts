import { iApplicationAbi } from "@cartesi/react";
import {
    BaseError,
    ContractFunctionExecutionError,
    ContractFunctionRevertedError,
    encodeErrorResult,
    UserRejectedRequestError,
} from "viem";
import { describe, expect, it } from "vitest";
import {
    getRevertErrorName,
    getRevertReason,
    isUserRejection,
} from "../../src/lib/contractErrors";

const solidityErrorAbi = [
    {
        type: "error",
        name: "Error",
        inputs: [{ name: "message", type: "string" }],
    },
] as const;

const revertWith = (data: `0x${string}`) =>
    new ContractFunctionExecutionError(
        new ContractFunctionRevertedError({
            abi: iApplicationAbi,
            data,
            functionName: "issueRefund",
        }),
        { abi: iApplicationAbi, functionName: "issueRefund", args: [1n, "0x"] },
    );

describe("contractErrors", () => {
    it("should name a custom error of the application ABI", () => {
        const error = revertWith(
            encodeErrorResult({
                abi: iApplicationAbi,
                errorName: "RefundAlreadyIssued",
                args: [1n],
            }),
        );

        expect(getRevertErrorName(error)).toBe("RefundAlreadyIssued");
        expect(getRevertReason(error)).toBeUndefined();
    });

    it("should expose the reason of a require revert", () => {
        const error = revertWith(
            encodeErrorResult({
                abi: solidityErrorAbi,
                errorName: "Error",
                args: ["ERC20: transfer amount exceeds balance"],
            }),
        );

        expect(getRevertReason(error)).toBe(
            "ERC20: transfer amount exceeds balance",
        );
        expect(getRevertErrorName(error)).toBe("Error");
    });

    it("should return nothing for errors that are not reverts", () => {
        expect(getRevertErrorName(new BaseError("rpc down"))).toBeUndefined();
        expect(getRevertReason(new Error("boom"))).toBeUndefined();
        expect(getRevertErrorName(undefined)).toBeUndefined();
    });

    it("should recognise a wallet rejection", () => {
        const rejection = new UserRejectedRequestError(new Error("denied"));

        expect(isUserRejection(rejection)).toBe(true);
        expect(
            isUserRejection(new BaseError("wrapped", { cause: rejection })),
        ).toBe(true);
        expect(isUserRejection(new BaseError("rpc down"))).toBe(false);
        expect(isUserRejection(new Error("boom"))).toBe(false);
    });
});
