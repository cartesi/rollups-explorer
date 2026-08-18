import { decodeOutput } from "@cartesi/codec";
import type { DelegateCallVoucher, Voucher, Withdrawal } from "@cartesi/client";
import {
    Alert,
    Box,
    Collapse,
    SegmentedControl,
    Stack,
    Switch,
    Title,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { cond, isNotNil } from "ramda";
import { useMemo, useState, type FC } from "react";
import { TbExclamationCircleFilled } from "react-icons/tb";
import { isHex, type Hex } from "viem";
import { content } from "../../content";
import JSONViewer from "../JSONViewer";
import { LongText } from "../LongText";
import useVoucherDecoder, {
    type UseVoucherDecoderResult,
} from "../specification/hooks/useVoucherDecoder";

type HexFormat = "short" | "long";

type WithdrawalViewProps = {
    withdrawal: Withdrawal;
};

type DecodeOutputDataResult =
    | {
          status: "success";
          data: DelegateCallVoucher | Voucher;
      }
    | {
          status: "error";
          error: Error;
      };

const decodeOutputData = (output: Hex): DecodeOutputDataResult => {
    try {
        const decoded = decodeOutput(output);

        if (decoded.type === "Notice") {
            return {
                status: "error",
                error: new Error(
                    content.withdrawal.error.output.nonExecutable +
                        ` ${decoded.type}`,
                ),
            };
        }

        return {
            status: "success",
            data: decoded,
        };
    } catch (error) {
        return {
            status: "error",
            error: error as Error,
        };
    }
};

type GetWarningMessageArgs = {
    decodedDataResult: DecodeOutputDataResult;
    decoderResult: UseVoucherDecoderResult;
};

const isResultDecoded = (decoderResult: UseVoucherDecoderResult) =>
    isNotNil(decoderResult.data) && !isHex(decoderResult.data);

const getWarningMessage = cond<[GetWarningMessageArgs], string | null>([
    [({ decoderResult }) => decoderResult.status === "loading", () => null],
    [
        ({ decodedDataResult }) => decodedDataResult.status === "error",
        ({ decodedDataResult }) =>
            decodedDataResult.status === "error"
                ? decodedDataResult.error.message
                : null,
    ],
    [
        ({ decoderResult }) => !isResultDecoded(decoderResult),
        () => content.withdrawal.error.decode.destination,
    ],
    // Default case
    [() => true, () => null],
]);

export const WithdrawalView: FC<WithdrawalViewProps> = ({ withdrawal }) => {
    const [opened, { toggle }] = useDisclosure(false);
    const theme = useMantineTheme();
    const [format, setFormat] = useState<HexFormat>("short");
    const decodedDataResult = useMemo(
        () => decodeOutputData(withdrawal.output),
        [withdrawal.output],
    );

    const decodedData =
        decodedDataResult.status === "success" ? decodedDataResult.data : null;
    const decoderResult = useVoucherDecoder({ voucher: decodedData });
    const isDecoded = isResultDecoded(decoderResult);
    const warningMessage = getWarningMessage({
        decodedDataResult,
        decoderResult,
    });

    return (
        <Stack gap="xs">
            <Box>
                <SegmentedControl
                    transitionDuration={300}
                    transitionTimingFunction="ease"
                    fullWidth={false}
                    value={format}
                    data={[
                        { label: content.global.format.short, value: "short" },
                        { label: content.global.format.long, value: "long" },
                    ]}
                    onChange={(value) => setFormat(value as HexFormat)}
                />
            </Box>

            <Title order={4}>{content.withdrawal.account}</Title>
            <LongText
                value={withdrawal.account}
                shorten={format === "short" ? 34 : false}
                copyButton
                style={{ wordBreak: "break-word" }}
                c="dimmed"
            />

            <Title order={4}>{content.withdrawal.output}</Title>
            <LongText
                value={withdrawal.output}
                shorten={format === "short" ? 34 : false}
                copyButton
                style={{ wordBreak: "break-word" }}
                c="dimmed"
            />

            {warningMessage ? (
                <Alert
                    icon={
                        <TbExclamationCircleFilled
                            size={theme.other.mdIconSize}
                        />
                    }
                    color="warning"
                >
                    {warningMessage}
                </Alert>
            ) : (
                <Switch
                    checked={opened}
                    aria-expanded={opened}
                    onChange={toggle}
                    label={content.global.decoded.show}
                    size="md"
                    disabled={!isDecoded}
                />
            )}

            {isDecoded && (
                <Collapse in={opened} keepMounted>
                    <JSONViewer
                        content={decoderResult.data ?? ""}
                        key={`decoded-view-${withdrawal.output}`}
                    />
                </Collapse>
            )}
        </Stack>
    );
};
