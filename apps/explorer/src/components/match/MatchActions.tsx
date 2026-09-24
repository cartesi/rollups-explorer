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
import { useEffect, useMemo, useState, type FC } from "react";
import { TbArrowUp } from "react-icons/tb";
import {
    getAdvanceRanges,
    getAdvanceSide,
    getMatchProgress,
} from "../../lib/prtUtils";
import { BisectionItem } from "./BisectionItem";
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
     * The sub tournament to display.
     */
    subTournament?: Tournament;

    /**
     * The tournament the match belongs to.
     */
    tournament: Tournament;
}

export const MatchActions: FC<MatchActionsProps> = (props) => {
    const { advances, match, now, subTournament, tournament } = props;
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
                        timestamp={advance.updatedAt.getTime()}
                        total={total}
                    />
                ))}
                {match.deletionReason === "TIMEOUT" &&
                    match.winnerCommitment === "NONE" && (
                        <EliminationTimeoutItem
                            key="elimination-timeout"
                            claim1={advances.length % 2 === 0 ? claim1 : claim2}
                            claim2={advances.length % 2 === 0 ? claim2 : claim1}
                            now={now}
                            timestamp={match.updatedAt.getTime()}
                        />
                    )}
                {match.deletionReason === "TIMEOUT" &&
                    match.winnerCommitment !== "NONE" && (
                        <WinnerTimeoutItem
                            key="timeout"
                            loser={
                                match.winnerCommitment === "ONE"
                                    ? claim2
                                    : claim1
                            }
                            now={now}
                            timestamp={match.updatedAt.getTime()}
                            winner={{
                                hash:
                                    match.winnerCommitment === "ONE"
                                        ? claim1.hash
                                        : claim2.hash,
                            }}
                        />
                    )}
                {subTournament && (
                    <SubTournamentItem
                        claim={advances.length % 2 === 0 ? claim1 : claim2}
                        key="sub-tournament"
                        tournament={subTournament}
                        now={now}
                        range={[0n, 0n]} // XXX: need to get range from somewhere
                        timestamp={subTournament.updatedAt.getTime()}
                    />
                )}
                {match.deletionReason === "CHILD_TOURNAMENT" &&
                    match.winnerCommitment !== "NONE" && (
                        <WinnerItem
                            key="winner"
                            claim={{
                                hash:
                                    match.winnerCommitment === "ONE"
                                        ? claim1.hash
                                        : claim2.hash,
                            }}
                            now={now}
                            timestamp={match.updatedAt.getTime()}
                            proof={"0x0"} // XXX: need to get proof from somewhere
                        />
                    )}
                {match.deletionReason === "CHILD_TOURNAMENT" &&
                    match.winnerCommitment !== "NONE" && (
                        <LoserItem
                            claim={
                                match.winnerCommitment === "ONE"
                                    ? claim2
                                    : claim1
                            }
                            now={now}
                        />
                    )}

                {match.deletionReason === "CHILD_TOURNAMENT" &&
                    match.winnerCommitment === "NONE" && (
                        <ClaimsEliminatedItem
                            now={now}
                            timestamp={match.updatedAt.getTime()}
                        />
                    )}

                {match.deletionReason === "STEP" &&
                    match.winnerCommitment !== "NONE" && (
                        <WinnerItem
                            key="winner"
                            claim={{
                                hash:
                                    match.winnerCommitment === "ONE"
                                        ? claim1.hash
                                        : claim2.hash,
                            }}
                            now={now}
                            timestamp={match.updatedAt.getTime()}
                            proof={"0x0"} // XXX: need to get proof from somewhere
                        />
                    )}
                {match.deletionReason === "STEP" &&
                    match.winnerCommitment !== "NONE" && (
                        <LoserItem
                            claim={
                                match.winnerCommitment === "ONE"
                                    ? claim2
                                    : claim1
                            }
                            now={now}
                        />
                    )}
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
