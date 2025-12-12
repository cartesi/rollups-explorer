import type { Commitment, Tournament } from "@cartesi/viem";
import { Stack } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { zeroHash } from "viem";
import { Hierarchy } from "../components/navigation/Hierarchy";
import { TournamentBreadcrumbSegment } from "../components/navigation/TournamentBreadcrumbSegment";
import * as TournamentViewStories from "../components/tournament/TournamentView.stories";
import type { Claim } from "../components/types";
import { routePathBuilder } from "../routes/routePathBuilder";
import { applications } from "../stories/data";
import {
    claim,
    generateTournamentAddress,
    randomMatches,
} from "../stories/util";
import { TournamentPage } from "./TournamentPage";

const meta = {
    title: "Pages/Tournament",
    component: TournamentPage,
    tags: ["autodocs"],
} satisfies Meta<typeof TournamentPage>;

export default meta;
type Story = StoryObj<typeof meta>;

type Props = Parameters<typeof TournamentPage>[0];

const WithBreadcrumb = (props: Props) => {
    const app = applications[0];
    const params = { application: app.name, epochIndex: "4" };

    return (
        <Stack gap="lg">
            <Hierarchy
                hierarchyConfig={[
                    { title: "Home", href: "/" },
                    {
                        title: app.name,
                        href: routePathBuilder.epochs(params),
                    },
                    {
                        title: `Epoch #4`,
                        href: routePathBuilder.epoch(params),
                    },
                    {
                        title: <TournamentBreadcrumbSegment level={0n} />,
                        href: "#",
                    },
                ]}
            />
            <TournamentPage {...props} />
        </Stack>
    );
};

export const TopLevelClosed: Story = {
    render: WithBreadcrumb,
    args: {
        commitments: TournamentViewStories.NoChallengerYet.args.commitments,
        matches: TournamentViewStories.NoChallengerYet.args.matches,
        tournament: TournamentViewStories.NoChallengerYet.args.tournament,
    },
};

export const TopLevelFinalized: Story = {
    render: WithBreadcrumb,
    args: {
        commitments: TournamentViewStories.Finalized.args.commitments,
        matches: TournamentViewStories.Finalized.args.matches,
        tournament: TournamentViewStories.Finalized.args.tournament,
    },
};

export const TopLevelDispute: Story = {
    render: WithBreadcrumb,
    args: {
        commitments: TournamentViewStories.Ongoing.args.commitments,
        matches: TournamentViewStories.Ongoing.args.matches,
        tournament: TournamentViewStories.Ongoing.args.tournament,
    },
};

/**
 * Create random claims
 */
const now = Math.floor(Date.now() / 1000);
const claims: Claim[] = Array.from({ length: 128 }).map((_, i) => claim(i));
const startCycle = 1837880065;
const endCycle = 2453987565;

const randomTournament: Tournament = {
    address: generateTournamentAddress(startCycle, endCycle),
    createdAt: new Date(now),
    epochIndex: 0n,
    finalStateHash: null,
    finishedAtBlock: 1n,
    height: 48n,
    level: 0n,
    log2step: 1n,
    maxLevel: 3n,
    parentMatchIdHash: null,
    parentTournamentAddress: null,
    updatedAt: new Date(now),
    winnerCommitment: null,
};

const commitments: Commitment[] = claims.map((claim, i) => ({
    blockNumber: BigInt(i),
    commitment: claim.hash,
    createdAt: new Date(now + i),
    epochIndex: 0n,
    finalStateHash: zeroHash,
    submitterAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    tournamentAddress: randomTournament.address,
    txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
    updatedAt: new Date(now + i),
}));

const matches = randomMatches(
    now,
    randomTournament,
    claims.map(({ hash }) => hash),
);

export const TopLevelLargeDispute: Story = {
    render: WithBreadcrumb,
    args: {
        commitments,
        matches,
        tournament: randomTournament,
    },
};

export const MidLevelDispute: Story = {
    render: WithBreadcrumb,
    args: {
        commitments: TournamentViewStories.MidLevelDispute.args.commitments,
        matches: TournamentViewStories.MidLevelDispute.args.matches,
        tournament: TournamentViewStories.MidLevelDispute.args.tournament,
    },
};
