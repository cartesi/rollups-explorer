import type { Match } from "@cartesi/viem";
import type { FC } from "react";
import { MatchBadge, type MatchBadgeProps } from "./MatchBadge";

type MatchBreadcrumbSegmentProps = {
    match?: Match | null;
    variant?: MatchBadgeProps["variant"];
};

export const MatchBreadcrumbSegment: FC<MatchBreadcrumbSegmentProps> = ({
    match,
    variant,
}) => {
    if (!match) {
        return null;
    }

    return (
        <MatchBadge
            claim1={{ hash: match.commitmentOne }}
            claim2={{ hash: match.commitmentTwo }}
            size="compact-xs"
            variant={variant}
        />
    );
};
