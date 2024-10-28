"use client";

import { JsonInput, SegmentedControl, Textarea } from "@mantine/core";
import { FC, ReactNode, useEffect, useRef } from "react";
import { hexToString, isHex } from "viem";

export type RequiredContentType = "raw" | "text" | "json";

export type ContentType = RequiredContentType | "decoded";

export type ContentChildrenPosition = "top" | "middle" | "bottom";
export interface ContentProps {
    content: string;
    contentType: ContentType;
    onContentTypeChange?: (contentType: ContentType) => void;
    children?: ReactNode;
    /**default to be located at the bottom, after the textarea element.*/
    childrenPosition?: ContentChildrenPosition;
    /**
     *  Add a React node independently above the segment control.
     */
    topPosition?: ReactNode;
    /**
     * Add a React node independently between the content and the segment control.
     */
    middlePosition?: ReactNode;
    additionalControls?: Omit<ContentType, RequiredContentType>[];
}
interface ContentTypeGroupedButtons {
    type: ContentType;
    additionalControls?: ContentProps["additionalControls"];
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
}

export const DisplayContent: FC<DisableContentProps> = (props) => {
    const { content, type } = props;
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
                    value={value}
                    readOnly
                    placeholder="No content defined"
                />
            )}
        </>
    );
};
