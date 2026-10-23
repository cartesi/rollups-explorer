import type { Application, EpochStatus, Input } from "@cartesi/client";
import { Stack } from "@mantine/core";
import { isNotNil } from "ramda";
import type { FC } from "react";
import { isForeclosed } from "../application/utils";
import { isRefundableEpoch } from "../refund/lib/refundUtils";
import { RefundDepositAction } from "../refund/RefundDepositAction";
import { InputCard } from "./InputCard";

interface Props {
    inputs: Input[];

    /** Only a foreclosed application gets the refund action on its deposit inputs. */
    application?: Application;

    /** Inputs of an accepted epoch never get the refund action. */
    epochStatusByIndex?: Map<bigint, EpochStatus>;

    onRefunded?: () => void;
}

export const InputList: FC<Props> = ({
    inputs,
    application,
    epochStatusByIndex,
    onRefunded,
}) => {
    const refundable = isNotNil(application) && isForeclosed(application);

    return (
        <Stack gap="xs" pb="md">
            {inputs.map((input) => {
                const epochStatus = epochStatusByIndex?.get(input.epochIndex);
                const showRefund =
                    refundable &&
                    (epochStatus === undefined ||
                        isRefundableEpoch(epochStatus));

                return (
                    <InputCard
                        input={input}
                        key={input.index}
                        footer={
                            showRefund ? (
                                <RefundDepositAction
                                    application={application.applicationAddress}
                                    input={input}
                                    epochStatus={epochStatus}
                                    onRefunded={onRefunded}
                                />
                            ) : undefined
                        }
                    />
                );
            })}
        </Stack>
    );
};
