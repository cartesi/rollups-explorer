import type { BondEvent, Commitment, Match, Tournament } from "@cartesi/client";
import {
    Badge,
    Card,
    Center,
    Stack,
    Switch,
    Tabs,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import { isEmpty } from "ramda";
import { useState, type FC } from "react";
import { TbCoins, TbSwords } from "react-icons/tb";
import type { Hash } from "viem";
import { content } from "../../content";
import type { JoinBond } from "../../lib/bondUtils";
import { formatMetaSpan } from "../../lib/metaCycleFormat";
import { getInnerTournamentAction } from "../../lib/disputeActions";
import { getTournamentCycleRange } from "../../lib/prtUtils";
import { BondLedger } from "../bond/BondLedger";
import { CycleRangeFormatted } from "../CycleRangeFormatted";
import { DetailRow } from "../DetailRow";
import { EnterTransition } from "../EnterTransition";
import { TournamentBreadcrumbSegment } from "../navigation/TournamentBreadcrumbSegment";
import TweenedNumber from "../TweenedNumber";
import { InnerTournamentAction } from "./InnerTournamentAction";
import { TournamentBondSection } from "./TournamentBondSection";
import { TournamentOutcome } from "./TournamentOutcome";
import { TournamentTable } from "./TournamentTable";

export type TournamentBondPool = {
    /**
     * Current balance of the tournament contract.
     */
    balance?: bigint;

    /**
     * Minimum bond each join must post.
     */
    bondValue?: bigint;

    /**
     * Bonds the commitments posted on join, as they resolve.
     */
    bonds: JoinBond[];

    /**
     * Whether the bond value, join bonds or balance are still being fetched.
     */
    loading?: boolean;
};

export type TournamentParentMatch = {
    /**
     * The sealed parent match this inner tournament settles.
     */
    match?: Match | null;

    /**
     * Called once a call settling the parent match is confirmed.
     */
    onActionConfirmed?: () => void;

    /**
     * Root children of the inner winner's parent commitment.
     */
    winnerChildren?: readonly [Hash, Hash];

    /**
     * Whether the winner's root children are still being read.
     */
    winnerChildrenLoading?: boolean;
};

export type TournamentTab = "matches" | "bonds";

export interface TournamentViewProps {
    /**
     * Bond refund and recovery events of the tournament.
     */
    bondEvents?: BondEvent[];

    /**
     * Total bond events of the tournament, as reported by the node. Defaults
     * to the number of events given.
     */
    bondEventsTotal?: number;

    /**
     * Bonds deposited into the tournament and its balance.
     */
    bondPool?: TournamentBondPool;

    /**
     * The list of all commitments.
     */
    commitments: Commitment[];

    /**
     * Called once a bond recovery sent from the page is confirmed.
     */
    onBondRecovered?: () => void;

    /**
     * The matches to display.
     */
    matches: Match[];

    /**
     * Total matches of the tournament, as reported by the node. Defaults to
     * the number of matches given.
     */
    matchesTotal?: number;

    /**
     * Called when another tab is selected.
     */
    onTabChange?: (tab: TournamentTab) => void;

    /**
     * Parent match of an inner tournament, to settle it once finished.
     */
    parent?: TournamentParentMatch;

    /**
     * The selected tab. Without it, the view keeps its own selection.
     */
    tab?: TournamentTab;

    /**
     * The tournament to display.
     */
    tournament: Tournament;
}

export const TournamentView: FC<TournamentViewProps> = (props) => {
    const {
        bondEvents = [],
        bondEventsTotal = bondEvents.length,
        bondPool,
        commitments,
        matches,
        matchesTotal = matches.length,
        onBondRecovered,
        onTabChange,
        parent,
        tab,
        tournament,
    } = props;

    const theme = useMantineTheme();
    const [hideWinners, setHideWinners] = useState(false);
    const [ownTab, setOwnTab] = useState<TournamentTab>("matches");
    const activeTab = tab ?? ownTab;
    const noCommitments = isEmpty(commitments);
    const text = content.tournament;
    const bondSettled =
        tournament.snapshot.bondRecovery.disposition !== "TOURNAMENT_RUNNING";

    return (
        <Stack gap="xl">
            <Stack gap="xs">
                <DetailRow label={text.levelTxt}>
                    <TournamentBreadcrumbSegment
                        level={tournament.level}
                        variant="filled"
                    />
                </DetailRow>
                <DetailRow
                    label={text.cycleRangeTxt}
                    hint={text.cycle.rangeHint}
                >
                    <CycleRangeFormatted
                        range={getTournamentCycleRange(tournament)}
                    />
                </DetailRow>
                <DetailRow label={text.leafSizeTxt}>
                    <Text>{formatMetaSpan(tournament.log2step)}</Text>
                </DetailRow>
                <DetailRow label={text.spanTxt}>
                    <Text>
                        {formatMetaSpan(
                            tournament.log2step + tournament.height,
                        )}
                    </Text>
                </DetailRow>
                <TournamentOutcome snapshot={tournament.snapshot} />
                {getInnerTournamentAction(tournament, parent?.match) && (
                    <DetailRow label={text.innerAction.labelTxt}>
                        <InnerTournamentAction
                            child={tournament}
                            parentMatch={parent?.match}
                            winnerChildren={parent?.winnerChildren}
                            winnerChildrenLoading={
                                parent?.winnerChildrenLoading
                            }
                            onConfirmed={parent?.onActionConfirmed}
                        />
                    </DetailRow>
                )}
            </Stack>

            {(bondSettled || bondPool) && (
                <TournamentBondSection
                    bondEvents={bondEvents}
                    bondPool={bondPool}
                    joins={commitments.length}
                    onBondRecovered={onBondRecovered}
                    tournament={tournament}
                />
            )}

            <Tabs
                value={activeTab}
                onChange={(value) => {
                    const next = value === "bonds" ? "bonds" : "matches";
                    setOwnTab(next);
                    onTabChange?.(next);
                }}
                keepMounted={false}
            >
                <Tabs.List>
                    <Tabs.Tab
                        value="matches"
                        leftSection={<TbSwords size={theme.other.smIconSize} />}
                        rightSection={
                            <Badge size="sm" variant="light">
                                <TweenedNumber value={matchesTotal} />
                            </Badge>
                        }
                    >
                        {text.tabs.matchesTxt}
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="bonds"
                        leftSection={<TbCoins size={theme.other.smIconSize} />}
                        rightSection={
                            <Badge size="sm" variant="light">
                                <TweenedNumber value={bondEventsTotal} />
                            </Badge>
                        }
                    >
                        {text.tabs.bondsTxt}
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="matches" pt="md">
                    <EnterTransition>
                        <Stack gap="sm">
                            <Switch
                                label={text.showPendingMatchesTxt}
                                labelPosition="left"
                                size="md"
                                checked={hideWinners}
                                onChange={(event) =>
                                    setHideWinners(event.currentTarget.checked)
                                }
                            />
                            <TournamentTable
                                candidate={tournament.snapshot.candidate}
                                matches={matches}
                                hideWinners={hideWinners}
                            />
                            {noCommitments && (
                                <Card>
                                    <Center>
                                        <Title order={3}>
                                            {text.noClaimsTxt}
                                        </Title>
                                    </Center>
                                </Card>
                            )}
                        </Stack>
                    </EnterTransition>
                </Tabs.Panel>
                <Tabs.Panel value="bonds" pt="md">
                    <EnterTransition>
                        <BondLedger events={bondEvents} />
                    </EnterTransition>
                </Tabs.Panel>
            </Tabs>
        </Stack>
    );
};
