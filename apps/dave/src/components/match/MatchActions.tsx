import type { Match, MatchAdvanced, Tournament } from "@cartesi/viem";
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
import type { CycleRange } from "../types";
import { BisectionItem } from "./BisectionItem";
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
     * Maximum number of bisections to reach the target subdivision
     * height = 48 means 47 bisections
     */
    height: bigint;

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
}

export const MatchActions: FC<MatchActionsProps> = (props) => {
    const { advances, height, match, now, subTournament } = props;
    const claim1 = { hash: match.commitmentOne };
    const claim2 = { hash: match.commitmentTwo };

    // filter the bisection items
    const bisections = advances.map((matchAdvanced, index, array) => {
        // direction is defined whether the parent of the advance is the left node of the previous advance, otherwise it's the right node
        const left = index === 0 ? match.leftOfTwo : array[index - 1].leftNode;
        const direction = matchAdvanced.otherParent === left ? 0 : 1;
        return {
            direction,
            timestamp: matchAdvanced.updatedAt.getTime(),
        };
    });

    // track the width of the timeline, so we can adjust the number of bars before size reset
    const { width: bisectionWidth, ref: bisectionWidthRef } = useElementSize();

    // calculate the number of bars until the size resets
    const [bars, setBars] = useState(bisections.length);
    useEffect(() => {
        const minWidth = 28;
        if (bisectionWidth === 0) {
            setBars(bisections.length);
        } else {
            setBars(Math.floor(Math.log2(bisectionWidth / minWidth)));
        }
    }, [bisectionWidth]);

    // dynamic domain, based on first visible item
    const maxRange: CycleRange = [0, 2 ** Number(height - 1n)];

    // progress bar, based on last visible item
    const progress = (bisections.length / Number(height - 1n)) * 100;

    // create ranges for each bisection
    const ranges = useMemo(
        () =>
            bisections.reduce(
                (r, bisection, i) => {
                    const { direction } = bisection;
                    const l = r[i];
                    const [s, e] = l;
                    const mid = Math.floor((s + e) / 2);
                    r.push(direction === 0 ? [s, mid] : [mid, e]);
                    return r;
                },
                [maxRange],
            ),
        [bisections],
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
                {bisections.map((value, i) => (
                    <BisectionItem
                        key={i}
                        claim={i % 2 === 0 ? claim1 : claim2}
                        color={theme.colors.gray[6]}
                        domain={ranges[Math.floor(i / bars) * bars] ?? [0, 1]} //xxx : a default to avoid unstable undefined error and division by zero.
                        expand={
                            i % bars === bars - 1 && i < bisections.length - 1
                        }
                        index={i + 1}
                        now={now}
                        range={ranges[i + 1]}
                        timestamp={value.timestamp}
                        total={Number(height - 1n)}
                    />
                ))}
                {match.deletionReason === "TIMEOUT" &&
                    match.winnerCommitment === "NONE" && (
                        <EliminationTimeoutItem
                            key="elimination-timeout"
                            claim1={
                                bisections.length % 2 === 0 ? claim1 : claim2
                            }
                            claim2={
                                bisections.length % 2 === 0 ? claim2 : claim1
                            }
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
                        claim={bisections.length % 2 === 0 ? claim1 : claim2}
                        key="sub-tournament"
                        tournament={subTournament}
                        now={now}
                        range={[0, 0]} // XXX: need to get range from somewhere
                        timestamp={match.updatedAt.getTime()}
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
