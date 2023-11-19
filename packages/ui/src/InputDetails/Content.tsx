"use client";

import { JsonInput, SegmentedControl, Textarea } from "@mantine/core";
import { T, cond, equals, pipe, propOr } from "ramda";
import { Hex, hexToString } from "viem";

export interface ContentProps {
    content: string;
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

export const DisplayContent = cond<
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
