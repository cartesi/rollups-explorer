import type { Commitment, Match, Tournament } from "@cartesi/client";
import { Badge, Group, Stack, Text, type MantineColor } from "@mantine/core";
import type { FC } from "react";
import { zeroAddress } from "viem";
import { content } from "../../content";
import { formatMetaSpan } from "../../lib/metaCycleFormat";
import {
    getBlocksLeft,
    getCommitment,
    getResponder,
    getSegmentRange,
} from "../../lib/prtUtils";
import { ClaimText } from "../ClaimText";
import { CycleRangeFormatted } from "../CycleRangeFormatted";
import { DetailRow } from "../DetailRow";
import { InfoHint } from "../InfoHint";
import { LongText } from "../LongText";
import { MetaCycle } from "../MetaCycle";

export interface MatchStateProps {
    /**
     * Current snapshots of the two commitments, when available.
     */
    commitments?: Commitment[];

    /**
     * The match to display the state for.
     */
    match: Match;

    /**
     * The tournament the match belongs to.
     */
    tournament: Tournament;
}

const text = content.match;

const phaseColors: Record<Match["snapshot"]["phase"], MantineColor> = {
    UNINITIALIZED: "gray",
    BISECTING: "blue",
    READY_TO_SEAL: "yellow",
    SEALED: "green",
};

const CommitmentClock: FC<{ commitment: Commitment }> = ({ commitment }) => {
    const { snapshot } = commitment;
    const inactive = snapshot.claimer === zeroAddress;

    return (
        <Group gap="xs">
            <ClaimText
                claim={{ hash: commitment.commitment }}
                iconSize={24}
                copyButton={false}
            />
            {inactive ? (
                <>
                    <Badge color="gray">{text.clock.inactiveTxt}</Badge>
                    <InfoHint label={text.clock.inactiveHint} />
                </>
            ) : snapshot.clockRunning ? (
                <>
                    <Badge color="blue">{text.clock.runningTxt}</Badge>
                    <Text size="sm" c="dimmed">
                        {`${text.clock.deadlineAtBlockTxt} ${snapshot.clockDeadline} (${getBlocksLeft(snapshot.clockDeadline, snapshot.asOfBlock)} ${text.clock.blocksLeftTxt})`}
                    </Text>
                </>
            ) : (
                <>
                    <Badge color="gray">{text.clock.pausedTxt}</Badge>
                    <Text size="sm" c="dimmed">
                        {`${snapshot.clockAllowance} ${text.clock.allowanceTxt}`}
                    </Text>
                </>
            )}
        </Group>
    );
};

export const MatchState: FC<MatchStateProps> = ({
    commitments = [],
    match,
    tournament,
}) => {
    const { snapshot } = match;
    const deleted = match.deletionReason !== "NOT_DELETED";
    const responder = getResponder(match);
    const segment = getSegmentRange(match, tournament);

    return (
        <Stack gap="xs">
            <DetailRow
                label={text.phaseTxt}
                hint={deleted ? text.closedHint : undefined}
            >
                <Badge color={deleted ? "gray" : phaseColors[snapshot.phase]}>
                    {deleted ? text.phase.closed : text.phase[snapshot.phase]}
                </Badge>
                <Text size="xs" c="dimmed">
                    {`${text.asOfBlockTxt} ${snapshot.asOfBlock}`}
                </Text>
            </DetailRow>
            {snapshot.phase === "BISECTING" && (
                <DetailRow label={text.heightTxt}>
                    <Text>
                        {`${snapshot.bisection.currentHeight} / ${tournament.height}`}
                    </Text>
                </DetailRow>
            )}
            {segment && (
                <>
                    <DetailRow
                        label={text.segmentTxt}
                        hint={content.tournament.cycle.inputSlotHint}
                    >
                        <CycleRangeFormatted range={segment} />
                    </DetailRow>
                    <DetailRow label={text.segmentSizeTxt}>
                        <Text>
                            {formatMetaSpan(
                                tournament.log2step +
                                    (snapshot.bisection?.currentHeight ?? 1n),
                            )}
                        </Text>
                    </DetailRow>
                </>
            )}
            {responder && (
                <DetailRow label={text.responderTxt}>
                    <ClaimText
                        claim={{ hash: getCommitment(match, responder) }}
                        iconSize={24}
                    />
                </DetailRow>
            )}
            {snapshot.phase === "SEALED" && (
                <>
                    <DetailRow
                        label={text.divergenceTxt}
                        hint={content.tournament.cycle.inputSlotHint}
                    >
                        <MetaCycle value={snapshot.sealed.divergenceCycle} />
                    </DetailRow>
                    <DetailRow label={text.agreeStateTxt}>
                        <LongText
                            value={snapshot.sealed.agreeState}
                            ff="monospace"
                        />
                    </DetailRow>
                </>
            )}
            {match.leafSeal && (
                <DetailRow label={text.leafSealedTxt}>
                    <Text size="sm" c="dimmed">
                        {`${text.leafSeal.atBlockTxt} ${match.leafSeal.blockNumber}, ${text.leafSeal.eliminableAtBlockTxt} ${match.leafSeal.eliminableAt}`}
                    </Text>
                </DetailRow>
            )}
            {!deleted && snapshot.timeoutOutcome !== "NONE" && (
                <DetailRow label="">
                    <Text c="orange">
                        {text.timeoutOutcome[snapshot.timeoutOutcome]}
                    </Text>
                </DetailRow>
            )}
            {!deleted && snapshot.deferredCharge > 0n && (
                <DetailRow label="">
                    <Text size="sm" c="dimmed">
                        {`${text.deferredCharge.prefixTxt} ${snapshot.deferredCharge} ${text.deferredCharge.suffixTxt}`}
                    </Text>
                </DetailRow>
            )}
            {!deleted && commitments.length > 0 && (
                <DetailRow label={text.clocksTxt}>
                    <Stack gap="xs">
                        {commitments.map((commitment) => (
                            <CommitmentClock
                                key={commitment.commitment}
                                commitment={commitment}
                            />
                        ))}
                    </Stack>
                </DetailRow>
            )}
        </Stack>
    );
};
