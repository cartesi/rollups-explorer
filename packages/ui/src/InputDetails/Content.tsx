"use client";

import { DecodeVoucherPayloadParamsType } from "@cartesi/decoder";
import {
    JsonInput,
    SegmentedControl,
    Skeleton,
    Stack,
    Textarea,
} from "@mantine/core";
import { cond, equals, pipe, propOr, T } from "ramda";
import { Hex, hexToString } from "viem";
import { useDecodeVoucherPayload } from "../hooks/useDecodeVoucherPayload";

interface FCContentType {
    type: ContentType;
    content: string | DecodeVoucherPayloadParamsType;
}

interface VoucherDisplayContentProps {
    type: ContentType;
    content: DecodeVoucherPayloadParamsType;
}

export interface ContentProps {
    content: string | DecodeVoucherPayloadParamsType;
    contentType: ContentType;
}

export type ContentType = "raw" | "text" | "json";

interface ContentTypeGroupedButtons {
    type: ContentType;
    onTypeChange: (v: ContentType) => void;
}

type SegmentControlData = { label: string; value: ContentType };

const segmentControlData: SegmentControlData[] = [
    { label: "Raw", value: "raw" },
    { label: "As Text", value: "text" },
    { label: "As JSON", value: "json" },
];

export const ContentTypeControl = ({
    type,
    onTypeChange,
}: ContentTypeGroupedButtons) => {
    return (
        <SegmentedControl
            value={type}
            onChange={(v: string) => onTypeChange(v as ContentType)}
            data={segmentControlData}
        />
    );
};

const LoadingState: React.FC = () => {
    return (
        <Stack>
            <Skeleton animate={false} height={8} radius="xl" />
            <Skeleton animate={false} height={8} mt={6} radius="xl" />
        </Stack>
    );
};

export const VoucherDisplayContent: React.FC<VoucherDisplayContentProps> = ({
    type,
    content,
}: {
    type: ContentType;
    content: DecodeVoucherPayloadParamsType;
}) => {
    const { data, loading, error } = useDecodeVoucherPayload(content);
    if (loading) return <LoadingState />;
    if (type === "json") {
        return (
            <JsonInput
                rows={10}
                value={
                    (error as unknown as string) ??
                    (JSON.stringify(data) as string)
                }
                readOnly
                placeholder="No content defined"
            />
        );
    }
    if (type === "text") {
        return (
            <Textarea
                rows={10}
                value={
                    (error as unknown as string) ??
                    (JSON.stringify(data) as string)
                }
                readOnly
                placeholder="No content defined"
            />
        );
    }
    return (
        <Textarea
            rows={10}
            value={content.payload as Hex}
            readOnly
            placeholder="No content defined"
        />
    );
};

export const DefaultDisplayContent = cond<
    [props: { type?: ContentType; content: string }],
    JSX.Element
>([
    [
        pipe(propOr("", "type"), equals("json")),
        ({ content }) => (
            <JsonInput
                rows={10}
                value={hexToString(content as Hex)}
                readOnly
                placeholder="No content defined"
            />
        ),
    ],
    [
        pipe(propOr("", "type"), equals("text")),
        ({ content }) => (
            <Textarea
                rows={10}
                value={hexToString(content as Hex)}
                readOnly
                placeholder="No content defined"
            />
        ),
    ],
    [
        T,
        ({ content }) => (
            <Textarea
                rows={10}
                value={content}
                readOnly
                placeholder="No content defined"
            />
        ),
    ],
]);

export const DisplayContent: React.FC<FCContentType> = ({ type, content }) => {
    if (typeof content !== "string") {
        return <VoucherDisplayContent type={type} content={content} />;
    } else {
        return <DefaultDisplayContent type={type} content={content} />;
    }
};
