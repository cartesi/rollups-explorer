"use client";

import { Group, Stack } from "@mantine/core";
import { isFunction, isNotNilOrEmpty } from "ramda-adjunct";
import { FC, useState } from "react";
import {
    ContentProps,
    ContentType,
    ContentTypeControl,
    DisplayContent,
} from "./Content";

export interface InputContentType extends FC<ContentProps> {}

const InputContent: InputContentType = ({
    content,
    contentType,
    onContentTypeChange,
    children,
    childrenPosition,
    middlePosition,
    topPosition,
    additionalControls,
}) => {
    const [type, setContentType] = useState<ContentType>(contentType);
    const position = childrenPosition ?? "bottom";
    const hasChildren = isNotNilOrEmpty(children);

    return (
        <Stack>
            {position === "top" && hasChildren && children}
            {isNotNilOrEmpty(topPosition) && topPosition}
            <Group>
                <ContentTypeControl
                    type={type}
                    additionalControls={additionalControls}
                    onTypeChange={(contentType: ContentType) => {
                        setContentType(contentType);
                        isFunction(onContentTypeChange) &&
                            onContentTypeChange(contentType);
                    }}
                />
            </Group>
            {position === "middle" && hasChildren && children}
            {isNotNilOrEmpty(middlePosition) && middlePosition}
            <DisplayContent type={type} content={content} />
            {position === "bottom" && hasChildren && children}
        </Stack>
    );
};

InputContent.displayName = "InputContent";

export default InputContent;
