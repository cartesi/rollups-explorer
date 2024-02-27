import { describe, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useUndeployedApplication from "../../src/hooks/useUndeployedApplication";
import { zeroAddress } from "viem";

const applications = ["0x60a7048c3136293071605a4eaffef49923e981cc"];
const delay = 1000;
const waitTimeout = delay + 100;

describe("useUndeployedApplication hook", () => {
    it('should return "false" when address is invalid', async () => {
        const invalidAddress = "0x60a7048c3136293071605a4eaffef49923e981ccaaa";

        const { result } = renderHook(() =>
            useUndeployedApplication(invalidAddress, applications, delay),
        );

        await waitFor(() => expect(result.current).toBe(false), {
            timeout: waitTimeout,
        });
    });

    it('should return "false" when address is "zeroAddress"', async () => {
        const { result } = renderHook(() =>
            useUndeployedApplication(zeroAddress, applications, delay),
        );

        await waitFor(() => expect(result.current).toBe(false), {
            timeout: waitTimeout,
        });
    });

    it('should return "false" when address exists in applications', async () => {
        const [address] = applications;

        const { result } = renderHook(() =>
            useUndeployedApplication(
                address as `0x${string}`,
                applications,
                delay,
            ),
        );

        await waitFor(() => expect(result.current).toBe(false), {
            timeout: waitTimeout,
        });
    });

    it("should return 'true' when address is valid and non-zero and address doesn't exist in applications", async () => {
        const address = "0x60a7048c3136293071605a4eaffef49923e981ce";

        const { result } = renderHook(() =>
            useUndeployedApplication(address, applications, delay),
        );

        await waitFor(() => expect(result.current).toBe(true), {
            timeout: waitTimeout,
        });
    });
});
