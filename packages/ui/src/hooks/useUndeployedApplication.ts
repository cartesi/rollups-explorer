import { Address, isAddress, zeroAddress } from "viem";
import { useDebouncedValue } from "@mantine/hooks";

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
