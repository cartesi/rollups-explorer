"use client";
import { useDebouncedValue } from "@mantine/hooks";
import { type Address, isAddress, zeroAddress } from "viem";

/**
 * @deprecated
 * @param address
 * @param applications
 * @param delay
 * @returns
 */
export default function useUndeployedApplication(
    address: Address,
    applications: string[],
    delay = 1000,
) {
    const [isUndeployedApp] = useDebouncedValue(
        isAddress(address) &&
            address !== zeroAddress &&
            !applications.some(
                (a) => a.toLowerCase() === address.toLowerCase(),
            ),
        delay,
    );

    return isUndeployedApp;
}
