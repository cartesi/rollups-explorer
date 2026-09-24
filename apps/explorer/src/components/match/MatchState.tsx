import type { Commitment, Match, Tournament } from "@cartesi/client";
import { Badge, Group, Stack, Text, type MantineColor } from "@mantine/core";
import type { FC } from "react";
import { zeroAddress } from "viem";
import { content } from "../../content";
import { getBlocksLeft, getCommitment, getResponder } from "../../lib/prtUtils";
import { ClaimText } from "../ClaimText";
import { InfoHint } from "../InfoHint";
import { LongText } from "../LongText";

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

    return (
        <Stack gap="sm">
            <Group>
                <Text>{text.phaseTxt}</Text>
                <Badge color={deleted ? "gray" : phaseColors[snapshot.phase]}>
                    {deleted ? text.phase.closed : text.phase[snapshot.phase]}
                </Badge>
                <Text size="xs" c="dimmed">
                    {`${text.asOfBlockTxt} ${snapshot.asOfBlock}`}
                </Text>
                {deleted && <InfoHint label={text.closedHint} />}
            </Group>
            {snapshot.phase === "BISECTING" && (
                <Group>
                    <Text>{text.heightTxt}</Text>
                    <Text>
                        {`${snapshot.bisection.currentHeight} / ${tournament.height}`}
                    </Text>
                </Group>
            )}
            {(snapshot.phase === "BISECTING" ||
                snapshot.phase === "READY_TO_SEAL") && (
                <Group>
                    <Text>{text.segmentStartCycleTxt}</Text>
                    <Text>
                        {snapshot.bisection.segmentStartCycle.toString()}
                    </Text>
                </Group>
            )}
            {responder && (
                <Group>
                    <Text>{text.responderTxt}</Text>
                    <ClaimText
                        claim={{ hash: getCommitment(match, responder) }}
                        iconSize={24}
                    />
                </Group>
            )}
            {snapshot.phase === "SEALED" && (
                <>
                    <Group>
                        <Text>{text.divergenceCycleTxt}</Text>
                        <Text>
                            {snapshot.sealed.divergenceCycle.toString()}
                        </Text>
                    </Group>
                    <Group>
                        <Text>{text.agreeStateTxt}</Text>
                        <LongText
                            value={snapshot.sealed.agreeState}
                            ff="monospace"
                        />
                    </Group>
                </>
            )}
            {match.leafSeal && (
                <Group>
                    <Text>{text.leafSealedTxt}</Text>
                    <Text size="sm" c="dimmed">
                        {`${text.leafSeal.atBlockTxt} ${match.leafSeal.blockNumber}, ${text.leafSeal.eliminableAtBlockTxt} ${match.leafSeal.eliminableAt}`}
                    </Text>
                </Group>
            )}
            {!deleted && snapshot.timeoutOutcome !== "NONE" && (
                <Text c="orange">
                    {text.timeoutOutcome[snapshot.timeoutOutcome]}
                </Text>
            )}
            {!deleted && snapshot.deferredCharge > 0n && (
                <Text size="sm" c="dimmed">
                    {`${text.deferredCharge.prefixTxt} ${snapshot.deferredCharge} ${text.deferredCharge.suffixTxt}`}
                </Text>
            )}
            {!deleted && commitments.length > 0 && (
                <Stack gap="xs">
                    <Text>{text.clocksTxt}</Text>
                    {commitments.map((commitment) => (
                        <CommitmentClock
                            key={commitment.commitment}
                            commitment={commitment}
                        />
                    ))}
                </Stack>
            )}
        </Stack>
    );
};
