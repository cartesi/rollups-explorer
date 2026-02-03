import type {
    DelegateCallVoucher,
    GetOutputReturnType,
    Notice,
    Voucher,
} from "@cartesi/viem";
import { Divider, Fieldset, Group, Spoiler, Text } from "@mantine/core";
import type { FC } from "react";
import { formatUnits, isHex } from "viem";
import { getDecoder } from "../../lib/decoders";
import Address from "../Address";
import type { DecoderType } from "../types";

interface OutputViewProps {
    displayAs?: DecoderType;
    output: GetOutputReturnType;
}

type NoticeProps = { decodedData: Notice; decoderType: DecoderType };

const NoticeContent: FC<NoticeProps> = ({ decodedData, decoderType }) => {
    const decoderFn = getDecoder(decoderType);

    return (
        <Fieldset legend="Notice">
            <Spoiler hideLabel="Show less" showLabel="Show more" maxHeight={80}>
                <Text style={{ wordBreak: "break-all" }}>
                    {decoderFn(decodedData.payload)}
                </Text>
            </Spoiler>
        </Fieldset>
    );
};

type VoucherProps = {
    decodedData: Voucher | DelegateCallVoucher;
    decoderType: DecoderType;
    title?: string;
};

const VoucherContent: FC<VoucherProps> = ({
    decodedData,
    decoderType,
    title = "Voucher",
}) => {
    const decoderFn = getDecoder(decoderType);
    const hasPayload =
        isHex(decodedData.payload) && decodedData.payload !== "0x";
    const amount = decodedData.type === "Voucher" ? decodedData.value : 0n;
    const hasAmount = amount > 0n;
    console.log(amount);

    return (
        <Fieldset legend={title}>
            <Group gap="xs">
                <Text c="blue">Destination</Text>
                <Address value={decodedData.destination} wrap="nowrap" />
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
                        <Text style={{ wordBreak: "break-all" }}>
                            {decoderFn(decodedData.payload)}
                        </Text>
                    </Spoiler>
                </>
            )}
        </Fieldset>
    );
};

export const OutputView: FC<OutputViewProps> = ({
    displayAs = "raw",
    output,
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
                    decodedData={output.decodedData}
                    decoderType={displayAs}
                />
            ) : outputType === "DelegateCallVoucher" ? (
                <VoucherContent
                    title="Delegated Call Voucher"
                    decodedData={output.decodedData}
                    decoderType={displayAs}
                />
            ) : null}
        </>
    );
};
