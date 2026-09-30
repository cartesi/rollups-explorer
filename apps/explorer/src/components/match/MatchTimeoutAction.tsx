import type { Match } from "@cartesi/client";
import {
    useSimulateITournamentEliminateMatchByTimeout,
    useSimulateITournamentWinMatchByTimeout,
    useWriteITournamentEliminateMatchByTimeout,
    useWriteITournamentWinMatchByTimeout,
} from "@cartesi/react";
import { Group, Text } from "@mantine/core";
import type { FC } from "react";
import { TbClockX, TbTrophy } from "react-icons/tb";
import type { Address, Hash } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import { content } from "../../content";
import { getMatchTimeoutAction } from "../../lib/disputeActions";
import {
    DisputeActionButton,
    useDisputeSender,
} from "../dispute/DisputeAction";
import { InfoHint } from "../InfoHint";

const text = content.match.timeoutAction;

export interface MatchTimeoutActionProps {
    /**
     * Blocks left before a timeout win turns into eliminating both.
     */
    expiresIn?: bigint;

    match: Match;

    /**
     * Called once the transaction is confirmed.
     */
    onConfirmed?: () => void;

    /**
     * The tournament the match belongs to.
     */
    tournamentAddress: Address;

    /**
     * Root children of the winning commitment, read from its join.
     */
    winnerChildren?: readonly [Hash, Hash];

    /**
     * Whether the winner's root children are still being read.
     */
    winnerChildrenLoading?: boolean;
}

/**
 * Permissionless `winMatchByTimeout` or `eliminateMatchByTimeout` call, as the
 * match's timeout outcome allows.
 */
export const MatchTimeoutAction: FC<MatchTimeoutActionProps> = ({
    expiresIn,
    match,
    onConfirmed,
    tournamentAddress,
    winnerChildren,
    winnerChildrenLoading,
}) => {
    const action = getMatchTimeoutAction(match);
    const sender = useDisputeSender();
    const matchId = {
        commitmentOne: match.commitmentOne,
        commitmentTwo: match.commitmentTwo,
    };
    const isWin = action?.kind === "win";

    const prepareWin = useSimulateITournamentWinMatchByTimeout({
        address: tournamentAddress,
        args: winnerChildren ? [matchId, ...winnerChildren] : undefined,
        query: { enabled: sender.canSend && isWin && !!winnerChildren },
    });
    const prepareEliminate = useSimulateITournamentEliminateMatchByTimeout({
        address: tournamentAddress,
        args: [matchId],
        query: { enabled: sender.canSend && action?.kind === "eliminate" },
    });
    const executeWin = useWriteITournamentWinMatchByTimeout();
    const executeEliminate = useWriteITournamentEliminateMatchByTimeout();
    const prepare = isWin ? prepareWin : prepareEliminate;
    const execute = isWin ? executeWin : executeEliminate;
    const wait = useWaitForTransactionReceipt({ hash: execute.data });

    if (!action || sender.hidden) return null;

    if (isWin && !winnerChildren && !winnerChildrenLoading) {
        return (
            <Group gap={4}>
                <Text size="sm" c="dimmed">
                    {text.unavailableTxt}
                </Text>
                <InfoHint label={text.relayedJoinHint} />
            </Group>
        );
    }

    return (
        <DisputeActionButton
            label={isWin ? text.winTxt : text.eliminateTxt}
            doneLabel={isWin ? text.wonTxt : text.eliminatedTxt}
            successMessage={
                isWin ? text.winSuccessTxt : text.eliminateSuccessTxt
            }
            hint={text.hint}
            icon={isWin ? <TbTrophy /> : <TbClockX />}
            footer={
                isWin && expiresIn !== undefined
                    ? `${text.expiresInTxt} ${expiresIn} ${text.blocksTxt}`
                    : undefined
            }
            loading={winnerChildrenLoading && !winnerChildren}
            onConfirmed={onConfirmed}
            onSend={() =>
                sender.send(() => {
                    if (prepareWin.data && isWin)
                        executeWin.writeContract(prepareWin.data.request);
                    if (prepareEliminate.data && !isWin)
                        executeEliminate.writeContract(
                            prepareEliminate.data.request,
                        );
                })
            }
            stages={{
                prepare,
                execute,
                wait,
                pending:
                    prepare.isFetching || execute.isPending || wait.isLoading,
                confirmed: wait.isSuccess,
                started:
                    execute.isPending ||
                    wait.isLoading ||
                    execute.isSuccess ||
                    execute.isError ||
                    prepare.isError,
            }}
        />
    );
};
