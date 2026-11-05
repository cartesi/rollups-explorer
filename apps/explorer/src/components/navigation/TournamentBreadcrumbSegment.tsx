import type { Tournament } from "@cartesi/client";
import { Button, type ButtonVariant } from "@mantine/core";
import type { FC } from "react";
import { content } from "../../content";
import { getTournamentLabel } from "../../lib/prtUtils";

type TournamentBreadcrumbSegmentProps = {
    /**
     * The tournament to name, root, inner or leaf. Empty while it loads.
     */
    tournament?: Pick<Tournament, "level" | "kind">;
    variant?: ButtonVariant;
};

export const TournamentBreadcrumbSegment: FC<
    TournamentBreadcrumbSegmentProps
> = ({ tournament, variant }) => (
    <Button variant={variant} size="compact-xs" radius="xl">
        {tournament && content.tournament.label[getTournamentLabel(tournament)]}
    </Button>
);
