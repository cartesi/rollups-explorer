import { useEffect, useState } from "react";
import { Address, isAddress, zeroAddress } from "viem";

export default function useUndeployedApplication(
    address: Address,
    applications: string[],
    delay = 1000,
) {
    const [isUndeployedApp, setUndeployedApp] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const isUndeployedApp =
                isAddress(address) &&
                address !== zeroAddress &&
                !applications.some(
                    (a) => a.toLowerCase() === address.toLowerCase(),
                );
            setUndeployedApp(isUndeployedApp);
        }, delay);

        return () => clearTimeout(timeout);
    }, [address, applications, delay]);

    return isUndeployedApp;
}
