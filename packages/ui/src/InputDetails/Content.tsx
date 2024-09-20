"use client";

import { JsonInput, SegmentedControl, Textarea } from "@mantine/core";
import { FC, ReactNode, useEffect, useRef } from "react";
import { hexToString, isHex } from "viem";

export type ContentType = "raw" | "text" | "json";

export type ContentChildrenPosition = "top" | "middle" | "bottom";
export interface ContentProps {
    content: string;
    contentType: ContentType;
    onContentTypeChange?: (contentType: ContentType) => void;
    children?: ReactNode;
    /**default to be located at the bottom, after the textarea element.*/
    childrenPosition?: ContentChildrenPosition;
    /**
     *  Add a react node independently above the segment control.
     */
    topPosition?: ReactNode;
    /**
     * add a react node independently between the content and the segment control.
     */
    middlePosition?: ReactNode;
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

export const DisplayContent: FC<{ type?: ContentType; content: string }> = ({
    content,
    type,
}) => {
    const value =
        type === "raw"
            ? content
            : isHex(content)
            ? hexToString(content)
            : content;
    const ref = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (ref.current !== null) {
            ref.current.blur();
        }
    });

    if (type === "raw" || type === "text")
        return (
            <Textarea
                key={`${type}-${value}`}
                rows={10}
                value={value}
                readOnly
                placeholder="No content defined"
            />
        );

    return (
        <JsonInput
            key={`${type}-${value}`}
            autoFocus
            ref={ref}
            rows={10}
            defaultValue={value}
            placeholder="No content defined"
            formatOnBlur
        />
    );
};
