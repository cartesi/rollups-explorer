import { UseERC20ReadsReturn } from "./hooks/useERC20Reads";

type ERC20ChecksProps = {
    erc20Reads: UseERC20ReadsReturn;
    amount: bigint | undefined;
};

export const isApprovalNeeded = ({ erc20Reads, amount }: ERC20ChecksProps) => {
    return (
        erc20Reads.allowance !== undefined &&
        erc20Reads.decimals !== undefined &&
        amount !== undefined &&
        erc20Reads.allowance < amount
    );
};

export const isReadyToDeposit = ({ erc20Reads, amount }: ERC20ChecksProps) => {
    return (
        erc20Reads.allowance !== undefined &&
        erc20Reads.balance !== undefined &&
        erc20Reads.decimals !== undefined &&
        amount !== undefined &&
        amount > 0 &&
        amount <= erc20Reads.allowance &&
        amount <= erc20Reads.balance
    );
};
