"use client";

import { JsonInput, SegmentedControl, Textarea } from "@mantine/core";
import { T, cond, equals, pipe, propOr } from "ramda";
import { ReactNode, useEffect, useRef } from "react";
import { Hex, hexToString } from "viem";

export type ContentType = "raw" | "text" | "json";

export type ContentChildrenPosition = "top" | "middle" | "bottom";
export interface ContentProps {
    content: string;
    contentType: ContentType;
    onContentTypeChange?: (contentType: ContentType) => void;
    children?: ReactNode;
    /**default to be located at the bottom, after the textarea element.*/
    childrenPosition?: ContentChildrenPosition;
}
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
        ({ content }) => {
            const value = hexToString(content as Hex);
            const ref = useRef<HTMLTextAreaElement>(null);

            useEffect(() => {
                if (ref.current !== null) {
                    ref.current.blur();
                }
            }, [value]);

            return (
                <JsonInput
                    autoFocus
                    ref={ref}
                    rows={10}
                    defaultValue={value}
                    placeholder="No content defined"
                    formatOnBlur
                />
            );
        },
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
