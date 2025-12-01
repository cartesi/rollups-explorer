import type { Match } from "@cartesi/viem";
import { Breadcrumbs, Button, type BreadcrumbsProps } from "@mantine/core";
import type { FC } from "react";
import { MatchBadge } from "./MatchBadge";

export interface MatchBreadcrumbsProps
    extends Omit<BreadcrumbsProps, "children"> {
    matches: Pick<Match, "commitmentOne" | "commitmentTwo">[];
}

export const MatchBreadcrumbs: FC<MatchBreadcrumbsProps> = (props) => {
    const { matches, ...breadcrumbsProps } = props;
    const levels = ["top", "middle", "bottom"];

    // build the breadcrumb of the tournament hierarchy
    const items = matches
        .map((match, index) => [
            <Button
                key={levels[index]}
                component="a"
                variant="default"
                size="compact-xs"
                radius="xl"
            >
                {levels[index]}
            </Button>,
            <MatchBadge
                key={index}
                claim1={{ hash: match.commitmentOne }}
                claim2={{ hash: match.commitmentTwo }}
                size="compact-xs"
                variant={index === matches.length - 1 ? undefined : "default"}
            />,
        ])
        .flat();

    return (
        <Breadcrumbs separator="→" {...breadcrumbsProps}>
            {items}
        </Breadcrumbs>
    );
};
