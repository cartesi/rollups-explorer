import type { Commitment, Tournament } from "@cartesi/client";
import { Stack } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { zeroHash } from "viem";
import { Hierarchy } from "../components/navigation/Hierarchy";
import { MatchBreadcrumbSegment } from "../components/navigation/MatchBreadcrumbSegment";
import { TournamentBreadcrumbSegment } from "../components/navigation/TournamentBreadcrumbSegment";
import * as TournamentViewStories from "../components/tournament/TournamentView.stories";
import type { Claim } from "../components/types";
import { pathBuilder } from "../routes/routePathBuilder";
import { applications } from "../stories/data";
import {
    claim,
    generateTournamentAddress,
    randomMatches,
} from "../stories/util";
import { TournamentPage } from "./TournamentPage";
import {
    createCommitment,
    createJoinBond,
    createTournament,
} from "../stories/prt";

const meta = {
    title: "Pages/Tournament",
    component: TournamentPage,
    tags: ["autodocs"],
} satisfies Meta<typeof TournamentPage>;

export default meta;
type Story = StoryObj<typeof meta>;

type Props = Parameters<typeof TournamentPage>[0];

/**
 * The breadcrumb of the container: an inner tournament comes after its root
 * tournament and parent match.
 */
const WithBreadcrumb = (props: Props) => {
    const app = applications[0];
    const params = { application: app.name, epochIndex: 4n };
    const { tournament, parent } = props;
    const ancestors =
        tournament.level > 0n
            ? [
                  {
                      title: (
                          <TournamentBreadcrumbSegment
                              tournament={{ level: 0n, kind: "NON_LEAF" }}
                              variant="default"
                          />
                      ),
                      href: "#",
                  },
                  {
                      title: (
                          <MatchBreadcrumbSegment
                              match={parent?.match}
                              variant="default"
                          />
                      ),
                      href: "#",
                  },
              ]
            : [];

    return (
        <Stack gap="lg">
            <Hierarchy
                hierarchyConfig={[
                    { title: "Home", href: "/" },
                    {
                        title: app.name,
                        href: pathBuilder.epochs(params),
                    },
                    {
                        title: `Epoch #4`,
                        href: pathBuilder.epoch(params),
                    },
                    ...ancestors,
                    {
                        title: (
                            <TournamentBreadcrumbSegment
                                tournament={tournament}
                                variant="filled"
                            />
                        ),
                        href: "#",
                    },
                ]}
            />
            <TournamentPage {...props} />
        </Stack>
    );
};

export const RootClosed: Story = {
    render: WithBreadcrumb,
    args: TournamentViewStories.NoChallengerYet.args,
};

export const RootFinalized: Story = {
    render: WithBreadcrumb,
    args: TournamentViewStories.Finalized.args,
};

export const RootDispute: Story = {
    render: WithBreadcrumb,
    args: TournamentViewStories.Ongoing.args,
};

/**
 * Create random claims
 */
const now = Math.floor(Date.now() / 1000);
const claims: Claim[] = Array.from({ length: 128 }).map((_, i) => claim(i));
const startCycle = 1837880065;
const endCycle = 2453987565;

const randomTournament: Tournament = createTournament({
    address: generateTournamentAddress(startCycle, endCycle),
    createdAt: new Date(now),
    epochIndex: 0n,
    height: 48n,
    level: 0n,
    log2step: 1n,
    maxLevel: 3n,
    parentMatchIdHash: null,
    parentTournamentAddress: null,
    updatedAt: new Date(now),
    snapshot: { standing: "MATCHES_ACTIVE" },
});

const commitments: Commitment[] = claims.map((claim, i) =>
    createCommitment({
        blockNumber: BigInt(i),
        commitment: claim.hash,
        createdAt: new Date(now + i),
        epochIndex: 0n,
        finalStateHash: zeroHash,
        submitterAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        tournamentAddress: randomTournament.address,
        txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
        updatedAt: new Date(now + i),
    }),
);

const largeBondValue = 21_300_000_000_000_000n;

const matches = randomMatches(
    now,
    randomTournament,
    claims.map(({ hash }) => hash),
);

export const RootLargeDispute: Story = {
    render: WithBreadcrumb,
    args: {
        bondPool: {
            balance: BigInt(commitments.length) * largeBondValue,
            bondValue: largeBondValue,
            bonds: commitments.map((commitment) =>
                createJoinBond(commitment, { value: largeBondValue }),
            ),
        },
        commitments,
        matches,
        tournament: randomTournament,
    },
};

export const LeafDispute: Story = {
    render: WithBreadcrumb,
    args: TournamentViewStories.LeafDispute.args,
};

export const LeafWinner: Story = {
    render: WithBreadcrumb,
    args: TournamentViewStories.ProvisionalInnerWinner.args,
};

export const RootDisputeWithRefunds: Story = {
    render: WithBreadcrumb,
    args: TournamentViewStories.RefundsOngoing.args,
};

export const RootBondRecovered: Story = {
    render: WithBreadcrumb,
    args: TournamentViewStories.BondRecovered.args,
};

export const RootBondPoolRunning: Story = {
    render: WithBreadcrumb,
    args: TournamentViewStories.BondPoolRunning.args,
};

export const RootBondPoolRecovered: Story = {
    render: WithBreadcrumb,
    args: TournamentViewStories.BondPoolRecovered.args,
};

export const RootBondPoolNoWinner: Story = {
    render: WithBreadcrumb,
    args: TournamentViewStories.BondPoolNoWinner.args,
};

export const RootBondsTab: Story = {
    render: WithBreadcrumb,
    args: { ...RootDisputeWithRefunds.args, tab: "bonds" },
};
