"use client";
import { Divider, Fieldset, Group, Spoiler, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { isNotNil } from "ramda";
import { type FC } from "react";
import { formatUnits, isHex, type Hex } from "viem";
import { useIsSmallDevice } from "../../hooks/useIsSmallDevice";
import { getDecoder } from "../../lib/decoders";
import Address from "../Address";
import JSONViewer from "../JSONViewer";
import useVoucherDecoder from "../specification/hooks/useVoucherDecoder";
import OutputExecution from "./OutputExecution";
import type {
    NoticeContentProps,
    OutputViewProps,
    VoucherContentProps,
    VoucherOutput,
} from "./types";

const NoticeContent: FC<NoticeContentProps> = ({
    decodedData,
    decoderType,
}) => {
    const decoderFn = getDecoder(decoderType);

    return (
        <Fieldset legend="Notice">
            <Spoiler>
                <Text style={{ wordBreak: "break-all" }}>
                    {decoderFn(decodedData.payload)}
                </Text>
            </Spoiler>
        </Fieldset>
    );
};

const VoucherContent: FC<VoucherContentProps> = ({
    decoderType,
    output,
    application,
    title = "Voucher",
}) => {
    const decoderFn = getDecoder(decoderType);
    const { isSmallDevice } = useIsSmallDevice();
    const { decodedData } = output;
    const hasPayload =
        isHex(decodedData.payload) && decodedData.payload !== "0x";
    const amount = decodedData.type === "Voucher" ? decodedData.value : 0n;
    const hasAmount = amount > 0n;
    const voucherDecodingRes = useVoucherDecoder({ voucher: decodedData });
    const hasDecodedData = isNotNil(voucherDecodingRes.data);
    const isDecodedSelected = decoderType === "decoded";

    return (
        <Fieldset legend={title}>
            <Group gap="xs">
                <Text c="blue">Destination</Text>
                <Address
                    value={decodedData.destination}
                    wrap="nowrap"
                    shorten={isSmallDevice}
                />
            </Group>

            {hasAmount && (
                <Group>
                    <Text c="blue">Amount</Text>
                    <Text>{formatUnits(amount, 18)}</Text>
                </Group>
            )}
            {hasPayload && (
                <>
                    <Divider my="sm" label="payload" labelPosition="center" />
                    <Spoiler
                        hideLabel="Show less"
                        showLabel="Show more"
                        maxHeight={80}
                    >
                        {hasDecodedData && isDecodedSelected ? (
                            <JSONViewer
                                content={voucherDecodingRes.data ?? ""}
                                key={`decoded-view-${output.index}-${decodedData.destination}`}
                            />
                        ) : (
                            <Text style={{ wordBreak: "break-all" }}>
                                {decoderFn(decodedData.payload)}
                            </Text>
                        )}
                    </Spoiler>
                </>
            )}

            <OutputExecution
                application={application as Hex}
                output={output}
                onSuccess={() => {
                    notifications.show({
                        title: "Voucher execution status",
                        message: "Executed successfully",
                        color: "green",
                        withBorder: true,
                    });
                }}
            />
        </Fieldset>
    );
};

export const OutputView: FC<OutputViewProps> = ({
    displayAs = "raw",
    output,
    application,
}) => {
    const outputType = output.decodedData.type;
    return (
        <>
            {outputType === "Notice" ? (
                <NoticeContent
                    decodedData={output.decodedData}
                    decoderType={displayAs}
                />
            ) : outputType === "Voucher" ? (
                <VoucherContent
                    application={application}
                    output={output as VoucherOutput}
                    decoderType={displayAs}
                />
            ) : outputType === "DelegateCallVoucher" ? (
                <VoucherContent
                    application={application}
                    title="Delegated Call Voucher"
                    output={output as VoucherOutput}
                    decoderType={displayAs}
                />
            ) : null}
        </>
    );
};
