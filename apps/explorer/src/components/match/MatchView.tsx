import type {
    Commitment,
    Match,
    MatchAdvanced,
    Tournament,
} from "@cartesi/client";
import {
    Badge,
    Stack,
    Tabs,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import { useState, type FC } from "react";
import { TbCoins, TbListDetails } from "react-icons/tb";
import type { Hash, Hex } from "viem";
import { content } from "../../content";
import type { JoinBond, PartialBondRefundEvent } from "../../lib/bondUtils";
import { getTournamentCycleRange } from "../../lib/prtUtils";
import { JoinBonds } from "../bond/JoinBonds";
import { ClaimText } from "../ClaimText";
import { CycleRangeFormatted } from "../CycleRangeFormatted";
import { DetailRow } from "../DetailRow";
import { EnterTransition } from "../EnterTransition";
import { getInnerTournamentAction } from "../../lib/disputeActions";
import { InnerTournamentAction } from "../tournament/InnerTournamentAction";
import { MatchActions } from "./MatchActions";
import { MatchState } from "./MatchState";

export type MatchTab = "overview" | "bonds";

export interface MatchViewProps {
    /**
     * List of advances (bisections) of the match
     */
    advances: MatchAdvanced[];

    /**
     * Current snapshots of the two match commitments.
     */
    commitments?: Commitment[];

    /**
     * Bonds the two commitments posted on join, by commitment.
     */
    joinBonds?: Map<Hash, JoinBond>;

    /**
     * Whether the join bonds are still being fetched.
     */
    joinBondsLoading?: boolean;

    /**
     * The match to display.
     */
    match: Match;

    /**
     * Called once a dispute call sent from the match is confirmed.
     */
    onActionConfirmed?: () => void;

    /**
     * Called when another tab is selected.
     */
    onTabChange?: (tab: MatchTab) => void;

    /**
     * Partial bond refunds of the tournament, by transaction hash.
     */
    refunds?: Map<Hash, PartialBondRefundEvent>;

    /**
     * The sub tournament to display.
     */
    subTournament?: Tournament;

    /**
     * The selected tab. Without it, the view keeps its own selection.
     */
    tab?: MatchTab;

    /**
     * The parent Tournament
     */
    tournament: Tournament;

    /**
     * The current timestamp.
     */
    now: number;

    /**
     * Proof of a leaf step win, `null` when it cannot be read.
     */
    stepProof?: Hex | null;

    /**
     * Timestamps in milliseconds of the blocks the match events happened in.
     */
    timestamps?: Map<bigint, number>;

    /**
     * Whether the block timestamps are still being fetched.
     */
    timestampsLoading?: boolean;
}

export const MatchView: FC<MatchViewProps> = (props) => {
    const {
        advances,
        commitments = [],
        joinBonds,
        joinBondsLoading,
        onActionConfirmed,
        onTabChange,
        tab,
        tournament,
        match,
        refunds,
        stepProof,
        subTournament,
        now,
        timestamps,
        timestampsLoading,
    } = props;
    const theme = useMantineTheme();
    const [ownTab, setOwnTab] = useState<MatchTab>("overview");
    const activeTab = tab ?? ownTab;
    const text = content.match;
    const claim1 = { hash: match.commitmentOne };
    const claim2 = { hash: match.commitmentTwo };
    const innerAction = subTournament
        ? getInnerTournamentAction(subTournament, match)
        : null;
    const innerWinner =
        innerAction?.kind === "win" ? innerAction.parentCommitment : undefined;
    const depositors = commitments.map((commitment) => ({
        commitment: commitment.commitment,
        depositor: commitment.submitterAddress,
    }));

    return (
        <Stack gap="xl">
            <Tabs
                value={activeTab}
                onChange={(value) => {
                    const next = value === "bonds" ? "bonds" : "overview";
                    setOwnTab(next);
                    onTabChange?.(next);
                }}
                keepMounted={false}
            >
                <Tabs.List>
                    <Tabs.Tab
                        value="overview"
                        leftSection={
                            <TbListDetails size={theme.other.smIconSize} />
                        }
                    >
                        {text.tabs.overviewTxt}
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="bonds"
                        leftSection={<TbCoins size={theme.other.smIconSize} />}
                        rightSection={
                            <Badge size="sm" variant="light">
                                {commitments.length}
                            </Badge>
                        }
                    >
                        {text.tabs.bondsTxt}
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="overview" pt="md">
                    <EnterTransition>
                        <Stack gap="xs">
                            <DetailRow
                                label={content.tournament.cycleRangeTxt}
                                hint={content.tournament.cycle.rangeHint}
                            >
                                <CycleRangeFormatted
                                    range={getTournamentCycleRange(tournament)}
                                />
                            </DetailRow>
                            <DetailRow label={text.claimsTxt}>
                                <ClaimText claim={claim1} />
                                <Text>vs</Text>
                                <ClaimText claim={claim2} />
                            </DetailRow>
                            <MatchState
                                commitments={commitments}
                                joinBonds={joinBonds}
                                joinBondsLoading={joinBondsLoading}
                                onActionConfirmed={onActionConfirmed}
                                match={match}
                                tournament={tournament}
                            />
                        </Stack>
                    </EnterTransition>
                </Tabs.Panel>
                <Tabs.Panel value="bonds" pt="md">
                    <EnterTransition>
                        <JoinBonds
                            bonds={joinBonds}
                            commitments={commitments}
                            loading={joinBondsLoading}
                        />
                    </EnterTransition>
                </Tabs.Panel>
            </Tabs>
            <Stack gap="sm">
                <Title order={3} c="dimmed">
                    {text.actionsTxt}
                </Title>
                <MatchActions
                    advances={advances}
                    depositors={depositors}
                    innerAction={
                        subTournament &&
                        innerAction && (
                            <InnerTournamentAction
                                child={subTournament}
                                parentMatch={match}
                                winnerChildren={
                                    innerWinner
                                        ? joinBonds?.get(innerWinner)?.children
                                        : undefined
                                }
                                winnerChildrenLoading={joinBondsLoading}
                                onConfirmed={onActionConfirmed}
                            />
                        )
                    }
                    match={match}
                    now={now}
                    refunds={refunds}
                    subTournament={subTournament}
                    stepProof={stepProof}
                    timestamps={timestamps}
                    timestampsLoading={timestampsLoading}
                    tournament={tournament}
                />
            </Stack>
        </Stack>
    );
};
