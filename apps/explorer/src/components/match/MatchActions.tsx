import type { Match, MatchAdvanced, Tournament } from "@cartesi/client";
import {
    Button,
    Group,
    Progress,
    Stack,
    Timeline,
    useMantineTheme,
} from "@mantine/core";
import {
    useElementSize,
    useInViewport,
    useMergedRef,
    useScrollIntoView,
} from "@mantine/hooks";
import {
    useEffect,
    useMemo,
    useState,
    type FC,
    type ReactElement,
} from "react";
import { TbArrowUp } from "react-icons/tb";
import {
    getAdvanceRanges,
    getAdvanceSide,
    getLoser,
    getMatchProgress,
    getTournamentCycleRange,
    getWinner,
} from "../../lib/prtUtils";
import type { Hash } from "viem";
import { content } from "../../content";
import type { PartialBondRefundEvent } from "../../lib/bondUtils";
import { BisectionItem } from "./BisectionItem";
import { BondRefundItem } from "./BondRefundItem";
import { ClaimsEliminatedItem } from "./ClaimsEliminatedItem";
import { EliminationTimeoutItem } from "./EliminationTimeoutItem";
import { LoserItem } from "./LoserItem";
import { SubTournamentItem } from "./SubTournamentItem";
import { WinnerItem } from "./WinnerItem";
import { WinnerTimeoutItem } from "./WinnerTimeoutItem";

interface MatchActionsProps {
    /**
     * List of advances (bisections) of the match
     */
    advances: MatchAdvanced[];

    /**
     * Whether to auto-adjust the ranges of the bisection items as user scrolls
     */
    autoAdjustRanges?: boolean;

    /**
     * The match to display actions for
     */
    match: Match;

    /**
     * Current timestamp
     */
    now: number;

    /**
     * Partial bond refunds of the tournament, by transaction hash.
     */
    refunds?: Map<Hash, PartialBondRefundEvent>;

    /**
     * The sub tournament to display.
     */
    subTournament?: Tournament;

    /**
     * Timestamps in milliseconds of the blocks the match events happened in.
     */
    timestamps?: Map<bigint, number>;

    /**
     * Whether the block timestamps are still being fetched.
     */
    timestampsLoading?: boolean;

    /**
     * The tournament the match belongs to.
     */
    tournament: Tournament;
}

export const MatchActions: FC<MatchActionsProps> = (props) => {
    const {
        advances,
        match,
        now,
        refunds,
        subTournament,
        timestamps,
        timestampsLoading,
        tournament,
    } = props;
    const isTimestampLoading = (timestamp?: number) =>
        Boolean(timestampsLoading) && timestamp === undefined;
    const claim1 = { hash: match.commitmentOne };
    const claim2 = { hash: match.commitmentTwo };
    const total = Number(tournament.height - 1n);

    // track the width of the timeline, so we can adjust the number of bars before size reset
    const { width: bisectionWidth, ref: bisectionWidthRef } = useElementSize();

    // calculate the number of bars until the size resets
    const [bars, setBars] = useState(advances.length);
    useEffect(() => {
        const minWidth = 28;
        if (bisectionWidth === 0) {
            setBars(advances.length);
        } else {
            setBars(Math.floor(Math.log2(bisectionWidth / minWidth)));
        }
    }, [bisectionWidth]);

    const progress = getMatchProgress(match, tournament, advances.length);

    const ranges = useMemo(
        () => getAdvanceRanges(tournament, advances),
        [tournament, advances],
    );

    // scroll hook points
    const { ref: topRefView, inViewport: topInViewport } = useInViewport();
    const { scrollIntoView: scrollToBottom, targetRef: bottomRef } =
        useScrollIntoView<HTMLDivElement>({
            offset: 60,
        });
    const { scrollIntoView: scrollToTop, targetRef: topRefScroll } =
        useScrollIntoView<HTMLDivElement>({
            offset: 60,
        });
    const ref = useMergedRef(bisectionWidthRef, topRefView, topRefScroll);

    // scroll to bottom on mount
    useEffect(() => {
        scrollToBottom();
    }, []);

    // colors for the progress bar
    const theme = useMantineTheme();
    const color = theme.primaryColor;

    const winner = getWinner(match);
    const loser = getLoser(match);
    const nextClaim =
        getAdvanceSide(advances.length) === "ONE" ? claim1 : claim2;
    const waitingClaim = nextClaim === claim1 ? claim2 : claim1;
    const closedAt = match.deletionBlockNumber
        ? timestamps?.get(match.deletionBlockNumber)
        : undefined;

    const refundItems = [
        {
            label: content.match.gasRefund.leafSealTxt,
            txHash: match.leafSeal?.txHash,
        },
        {
            label: content.match.gasRefund.subTournamentCreationTxt,
            txHash: subTournament?.creationEvent?.txHash,
        },
        {
            label: content.match.gasRefund.matchClosingTxt,
            txHash: match.deletionTxHash,
        },
    ].flatMap(({ label, txHash }) => {
        const refund = txHash ? refunds?.get(txHash) : undefined;
        return refund ? [{ label, refund }] : [];
    });

    const getOutcomeItems = (): ReactElement[] => {
        switch (match.deletionReason) {
            case "TIMEOUT":
                return winner && loser
                    ? [
                          <WinnerTimeoutItem
                              key="timeout"
                              loser={{ hash: loser }}
                              now={now}
                              timestamp={closedAt}
                              timestampLoading={isTimestampLoading(closedAt)}
                              winner={{ hash: winner }}
                          />,
                      ]
                    : [
                          <EliminationTimeoutItem
                              key="elimination-timeout"
                              claim1={nextClaim}
                              claim2={waitingClaim}
                              now={now}
                              timestamp={closedAt}
                              timestampLoading={isTimestampLoading(closedAt)}
                          />,
                      ];
            case "CHILD_TOURNAMENT":
            case "STEP":
                if (winner && loser) {
                    return [
                        <WinnerItem
                            key="winner"
                            claim={{ hash: winner }}
                            now={now}
                            timestamp={closedAt}
                            timestampLoading={isTimestampLoading(closedAt)}
                            proof={"0x0"} // XXX: need to get proof from somewhere
                        />,
                        <LoserItem
                            key="loser"
                            claim={{ hash: loser }}
                            now={now}
                        />,
                    ];
                }
                return match.deletionReason === "CHILD_TOURNAMENT"
                    ? [
                          <ClaimsEliminatedItem
                              key="eliminated"
                              now={now}
                              timestamp={closedAt}
                              timestampLoading={isTimestampLoading(closedAt)}
                          />,
                      ]
                    : [];
            case "NOT_DELETED":
                return [];
        }
    };

    return (
        <Stack>
            <Timeline ref={ref} bulletSize={24} lineWidth={2}>
                <Timeline.Item styles={{ itemBullet: { display: "none" } }}>
                    <Progress.Root>
                        <Progress.Section value={progress} color={color} />
                    </Progress.Root>
                </Timeline.Item>
            </Timeline>
            <Timeline bulletSize={24} lineWidth={2}>
                {advances.map((advance, i) => (
                    <BisectionItem
                        key={`${advance.txHash}-${advance.logIndex}`}
                        claim={getAdvanceSide(i) === "ONE" ? claim1 : claim2}
                        color={theme.colors.gray[6]}
                        domain={ranges[Math.floor(i / bars) * bars] ?? [0n, 1n]} //xxx : a default to avoid unstable undefined error and division by zero.
                        expand={
                            i % bars === bars - 1 && i < advances.length - 1
                        }
                        index={i + 1}
                        now={now}
                        range={ranges[i + 1]}
                        refund={refunds?.get(advance.txHash)}
                        timestamp={timestamps?.get(advance.blockNumber)}
                        timestampLoading={isTimestampLoading(
                            timestamps?.get(advance.blockNumber),
                        )}
                        total={total}
                    />
                ))}
                {subTournament && (
                    <SubTournamentItem
                        claim={nextClaim}
                        key="sub-tournament"
                        tournament={subTournament}
                        now={now}
                        range={getTournamentCycleRange(subTournament)}
                        timestamp={timestamps?.get(subTournament.startInstant)}
                        timestampLoading={isTimestampLoading(
                            timestamps?.get(subTournament.startInstant),
                        )}
                    />
                )}
                {getOutcomeItems()}
                {refundItems.map(({ label, refund }) => (
                    <BondRefundItem
                        key={`${refund.txHash}-${refund.logIndex}`}
                        label={label}
                        now={now}
                        refund={refund}
                    />
                ))}
            </Timeline>
            <Group justify="flex-end" ref={bottomRef}>
                {!topInViewport && (
                    <Button
                        variant="transparent"
                        leftSection={<TbArrowUp />}
                        onClick={() => scrollToTop()}
                    >
                        top
                    </Button>
                )}
            </Group>
        </Stack>
    );
};
