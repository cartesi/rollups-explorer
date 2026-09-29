import type { Meta, StoryObj } from "@storybook/nextjs";
import { createElement } from "react";
import { Ongoing } from "../components/tournament/TournamentView.stories";
import * as MatchActionsStories from "../components/match/MatchActions.stories";
import * as MatchStateStories from "../components/match/MatchState.stories";
import * as MatchViewStories from "../components/match/MatchView.stories";
import { MatchPage } from "./MatchPage";
import { randomAdvances } from "../stories/data";
import { toBlockTimestamps } from "../stories/util";

const meta = {
    title: "Pages/Match",
    component: MatchPage,
    render: (args) =>
        createElement(MatchPage, {
            ...args,
            timestamps:
                args.timestamps ??
                toBlockTimestamps(
                    args.advances,
                    args.match,
                    args.subTournament,
                ),
        }),
    tags: ["autodocs"],
} satisfies Meta<typeof MatchPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Date.now();

export const TopLevelMatch: Story = {
    args: {
        advances: [],
        match: Ongoing.args.matches[1],
        now,
        tournament: Ongoing.args.tournament,
    },
};

const advances = (count: number) =>
    randomAdvances({
        count,
        now: now - 7966,
        tournamentAddress: Ongoing.args.tournament.address,
    });

export const BisectingWithClocks: Story = {
    args: {
        ...TopLevelMatch.args,
        advances: advances(31),
        match: MatchStateStories.Bisecting.args.match,
        commitments: MatchStateStories.Bisecting.args.commitments,
    },
};

export const Sealed: Story = {
    args: {
        ...TopLevelMatch.args,
        advances: advances(47),
        match: MatchStateStories.Sealed.args.match,
    },
};

export const Closed: Story = {
    args: {
        ...TopLevelMatch.args,
        match: MatchStateStories.Closed.args.match,
    },
};

export const WithRefunds: Story = {
    args: {
        ...TopLevelMatch.args,
        advances: MatchActionsStories.WithRefunds.args.advances,
        match: MatchActionsStories.WithRefunds.args.match,
        refunds: MatchActionsStories.WithRefunds.args.refunds,
        tournament: MatchActionsStories.WithRefunds.args.tournament,
    },
};

export const WithJoinBonds: Story = {
    args: MatchViewStories.WithJoinBonds.args,
};
