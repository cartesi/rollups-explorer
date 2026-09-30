import type { Match, Tournament } from "@cartesi/client";
import {
    useSimulateITournamentEliminateInnerTournament,
    useSimulateITournamentWinInnerTournament,
    useWriteITournamentEliminateInnerTournament,
    useWriteITournamentWinInnerTournament,
} from "@cartesi/react";
import { Group, Text } from "@mantine/core";
import type { FC } from "react";
import { TbArrowBarUp, TbCircleX } from "react-icons/tb";
import { zeroAddress, type Hash } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import { content } from "../../content";
import {
    getInnerTournamentAction,
    getInnerWinExpiry,
} from "../../lib/disputeActions";
import {
    DisputeActionButton,
    useDisputeSender,
} from "../dispute/DisputeAction";
import { InfoHint } from "../InfoHint";

const text = content.tournament.innerAction;

export interface InnerTournamentActionProps {
    /**
     * The finished inner tournament.
     */
    child: Tournament;

    /**
     * Called once the transaction is confirmed.
     */
    onConfirmed?: () => void;

    /**
     * The sealed parent match the inner tournament settles.
     */
    parentMatch?: Match | null;

    /**
     * Root children of the winning parent commitment, read from its join.
     */
    winnerChildren?: readonly [Hash, Hash];

    /**
     * Whether the winner's root children are still being read.
     */
    winnerChildrenLoading?: boolean;
}

/**
 * Permissionless `winInnerTournament` or `eliminateInnerTournament` call on the
 * parent tournament, settling the parent match with the inner result.
 */
export const InnerTournamentAction: FC<InnerTournamentActionProps> = ({
    child,
    onConfirmed,
    parentMatch,
    winnerChildren,
    winnerChildrenLoading,
}) => {
    const action = getInnerTournamentAction(child, parentMatch);
    const sender = useDisputeSender();
    const parent = child.parentTournamentAddress ?? zeroAddress;
    const isWin = action?.kind === "win";

    const prepareWin = useSimulateITournamentWinInnerTournament({
        address: parent,
        args: winnerChildren ? [child.address, ...winnerChildren] : undefined,
        query: { enabled: sender.canSend && isWin && !!winnerChildren },
    });
    const prepareEliminate = useSimulateITournamentEliminateInnerTournament({
        address: parent,
        args: [child.address],
        query: { enabled: sender.canSend && action?.kind === "eliminate" },
    });
    const executeWin = useWriteITournamentWinInnerTournament();
    const executeEliminate = useWriteITournamentEliminateInnerTournament();
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

    const expiresIn = isWin ? getInnerWinExpiry(child) : undefined;

    return (
        <DisputeActionButton
            label={isWin ? text.winTxt : text.eliminateTxt}
            doneLabel={isWin ? text.wonTxt : text.eliminatedTxt}
            successMessage={
                isWin ? text.winSuccessTxt : text.eliminateSuccessTxt
            }
            hint={isWin ? text.winHint : text.eliminateHint}
            icon={isWin ? <TbArrowBarUp /> : <TbCircleX />}
            footer={
                expiresIn !== undefined
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
