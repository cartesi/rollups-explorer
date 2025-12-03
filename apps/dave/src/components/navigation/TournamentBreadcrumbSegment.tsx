import { Button, type ButtonVariant } from "@mantine/core";
import type { FC } from "react";

type TournamentBreadcrumbSegmentProps = {
    level: bigint;
    variant?: ButtonVariant;
};

export const TournamentBreadcrumbSegment: FC<
    TournamentBreadcrumbSegmentProps
> = ({ level, variant }) => {
    const labels = ["top", "middle", "bottom"];
    return (
        <Button variant={variant} size="compact-xs" radius="xl">
            {labels[Number(level)] ?? level}
        </Button>
    );
};
