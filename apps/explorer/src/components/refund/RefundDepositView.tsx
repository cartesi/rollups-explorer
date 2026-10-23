import {
    Badge,
    Button,
    Group,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";
import type { FC } from "react";
import {
    TbCircleCheckFilled,
    TbCoins,
    TbExclamationCircle,
} from "react-icons/tb";
import type { Hash } from "viem";
import { content } from "../../content";
import useRightColorShade from "../../hooks/useRightColorShade";
import {
    formatRefundAsset,
    type RefundAsset,
    type RefundStatus,
} from "./lib/refundUtils";
import Address from "../Address";
import { InfoHint } from "../InfoHint";
import TransactionHash from "../TransactionHash";

const text = content.refund;

export interface RefundStatusLabelProps {
    status: RefundStatus;

    /** Shown once refunded. */
    transactionHash?: Hash;

    /** Shown when the refund failed. */
    errorMessage?: string;
}

export const RefundStatusLabel: FC<RefundStatusLabelProps> = ({
    status,
    transactionHash,
    errorMessage,
}) => {
    const successColor = useRightColorShade("teal");
    const errorColor = useRightColorShade("red");
    const iconSize = useMantineTheme().other.smIconSize;

    switch (status) {
        case "refunded":
            return (
                <Group gap={6} wrap="nowrap">
                    <TbCircleCheckFilled size={iconSize} color={successColor} />
                    <Text size="sm" style={{ whiteSpace: "nowrap" }}>
                        {text.refundedTxt}
                    </Text>
                    {transactionHash && (
                        <TransactionHash transactionHash={transactionHash} />
                    )}
                </Group>
            );
        case "failed":
            return (
                <Group gap={6} wrap="nowrap">
                    <TbExclamationCircle size={iconSize} color={errorColor} />
                    <Text size="sm" c={errorColor}>
                        {errorMessage ?? text.failedTxt}
                    </Text>
                </Group>
            );
        case "refunding":
            return (
                <Text size="sm" c="dimmed">
                    {text.refundingTxt}
                </Text>
            );
        case "unknown":
            return (
                <Text size="sm" c="dimmed">
                    {text.checkingTxt}
                </Text>
            );
        case "unavailable":
            return (
                <Group gap={6} wrap="nowrap">
                    <TbExclamationCircle size={iconSize} color={errorColor} />
                    <Text
                        size="sm"
                        c={errorColor}
                        style={{ whiteSpace: "nowrap" }}
                    >
                        {text.unavailableTxt}
                    </Text>
                </Group>
            );
        case "refundable":
            return (
                <Group gap={6} wrap="nowrap">
                    <TbCoins size={iconSize} />
                    <Text size="sm" style={{ whiteSpace: "nowrap" }}>
                        {text.refundableTxt}
                    </Text>
                </Group>
            );
    }
};

const BatchItems: FC<{ items: { tokenId: bigint; value: bigint }[] }> = ({
    items,
}) => (
    <Group gap={6}>
        {items.map(({ tokenId, value }) => (
            <Badge
                key={tokenId.toString()}
                size="sm"
                variant="outline"
                color="gray"
                tt="none"
            >
                {text.tokenIdTxt}
                {tokenId.toString()} × {value.toString()}
            </Badge>
        ))}
    </Group>
);

export interface RefundDepositViewProps extends RefundStatusLabelProps {
    asset: RefundAsset;

    onRefund?: () => void;
}

/** What is refunded to whom, the button while refundable, and the outcome afterwards. */
export const RefundDepositView: FC<RefundDepositViewProps> = ({
    asset,
    status,
    transactionHash,
    errorMessage,
    onRefund,
}) => {
    const iconSize = useMantineTheme().other.smIconSize;
    const showButton = status !== "refunded";
    const showLabel = status !== "refundable";

    return (
        <Stack gap="xs">
            <Group gap={6}>
                <TbCoins size={iconSize} />
                <Text size="sm">
                    {`${text.previewTxt} ${formatRefundAsset(asset)} ${content.global.toTxt}`}
                </Text>
                <Address
                    value={asset.depositor}
                    iconSize={iconSize}
                    canCopy={false}
                    icon
                    shorten
                />
                <InfoHint label={text.hint} />
            </Group>
            {asset.kind === "erc1155-batch" && (
                <BatchItems items={asset.items} />
            )}
            <Group gap="sm">
                {showButton && (
                    <Button
                        size="xs"
                        leftSection={<TbCoins size={iconSize} />}
                        loading={status === "refunding" || status === "unknown"}
                        onClick={onRefund}
                    >
                        {status === "unavailable"
                            ? text.retryTxt
                            : text.refundTxt}
                    </Button>
                )}
                {showLabel && (
                    <RefundStatusLabel
                        status={status}
                        transactionHash={transactionHash}
                        errorMessage={errorMessage}
                    />
                )}
            </Group>
        </Stack>
    );
};
