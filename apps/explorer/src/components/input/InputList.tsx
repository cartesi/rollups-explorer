import type { Application, Input } from "@cartesi/client";
import { Stack } from "@mantine/core";
import { isNotNil } from "ramda";
import type { FC } from "react";
import { isForeclosed } from "../application/utils";
import { RefundDepositAction } from "../refund/RefundDepositAction";
import { InputCard } from "./InputCard";

interface Props {
    inputs: Input[];

    /** Only a foreclosed application gets the refund action on its deposit inputs. */
    application?: Application;

    /** Inputs of this epoch and later get the refund action; none until set. */
    refundableFromEpoch?: bigint;

    onRefunded?: () => void;
}

export const InputList: FC<Props> = ({
    inputs,
    application,
    refundableFromEpoch,
    onRefunded,
}) => {
    const refundable =
        isNotNil(application) &&
        isForeclosed(application) &&
        isNotNil(refundableFromEpoch);

    return (
        <Stack gap="xs" pb="md">
            {inputs.map((input) => {
                const showRefund =
                    refundable && input.epochIndex >= refundableFromEpoch;

                return (
                    <InputCard
                        input={input}
                        key={input.index}
                        footer={
                            showRefund ? (
                                <RefundDepositAction
                                    application={application.applicationAddress}
                                    input={input}
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
