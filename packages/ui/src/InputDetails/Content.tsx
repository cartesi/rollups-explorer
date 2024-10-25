"use client";

import { JsonInput, SegmentedControl, Textarea } from "@mantine/core";
import { FC, ReactNode, useEffect, useRef } from "react";
import { hexToString, isHex } from "viem";

export type ContentType = "raw" | "text" | "json" | "decoded";

export type ContentChildrenPosition = "top" | "middle" | "bottom";
export interface ContentProps {
    rawContent: string;
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
    additionalControls?: ContentType[];
}
interface ContentTypeGroupedButtons {
    type: ContentType;
    additionalControls?: ContentType[];
    onTypeChange: (v: ContentType) => void;
}

type SegmentControlData = {
    label: string;
    value: ContentType;
    required: boolean;
};

const segmentControlData: SegmentControlData[] = [
    { label: "Raw", value: "raw", required: true },
    { label: "As Text", value: "text", required: true },
    { label: "As JSON", value: "json", required: true },
    { label: "Decoded", value: "decoded", required: false },
];

export const ContentTypeControl = ({
    type,
    additionalControls = [],
    onTypeChange,
}: ContentTypeGroupedButtons) => {
    const data = segmentControlData.filter(
        (item) => item.required || additionalControls.includes(item.value),
    );
    return (
        <SegmentedControl
            value={type}
            onChange={(v: string) => onTypeChange(v as ContentType)}
            data={data}
        />
    );
};

interface DisableContentProps {
    type?: ContentType;
    content: string;
    rawContent: string;
}

export const DisplayContent: FC<DisableContentProps> = (props) => {
    const { content, type, rawContent } = props;
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

    return (
        <>
            {type === "json" ? (
                <JsonInput
                    key={`${type}-${value}`}
                    autoFocus
                    ref={ref}
                    rows={10}
                    defaultValue={value}
                    placeholder="No content defined"
                    formatOnBlur
                />
            ) : (
                <Textarea
                    key={`${type}-${value}`}
                    rows={10}
                    value={type === "raw" ? rawContent : value}
                    readOnly
                    placeholder="No content defined"
                />
            )}
        </>
    );
};
