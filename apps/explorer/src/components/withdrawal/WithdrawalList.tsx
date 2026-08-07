import type { Withdrawal } from "@cartesi/viem";
import { Stack } from "@mantine/core";
import { type FC } from "react";
import { v4 } from "uuid";
import { WithdrawalCard } from "./WithdrawalCard";

type WithdrawalListProps = {
    withdrawals: Withdrawal[];
};

export const WithdrawalList: FC<WithdrawalListProps> = ({ withdrawals }) => {
    return (
        <Stack id={`withdrawal-list-items-${v4()}`}>
            {withdrawals.map((withdrawal, index) => (
                <WithdrawalCard
                    key={`withdrawal-${index}-${withdrawal.accountIndex.toString()}`}
                    withdrawal={withdrawal}
                />
            ))}
        </Stack>
    );
};
