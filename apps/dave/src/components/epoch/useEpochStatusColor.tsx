import type { Epoch, EpochStatus } from "@cartesi/viem";
import useRightColorShade from "../../hooks/useRightColorShade";

export const getEpochStatusColor = (state: EpochStatus) => {
    switch (state) {
        case "OPEN":
        case "INPUTS_PROCESSED":
            return "open";
        case "CLAIM_COMPUTED":
        case "CLAIM_REJECTED":
        case "CLAIM_SUBMITTED":
        case "CLOSED":
            return "closed";
        case "CLAIM_ACCEPTED":
            return "finalized";
        default:
            return "gray";
    }
};

export const useEpochStatusColor = (epoch: Epoch) => {
    const statusColor = useRightColorShade(getEpochStatusColor(epoch.status));
    const disputeColor = useRightColorShade("disputed");
    return false ? disputeColor : statusColor;
};
