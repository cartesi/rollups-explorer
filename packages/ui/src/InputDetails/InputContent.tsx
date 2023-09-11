"use client";

import { Group, Stack } from "@mantine/core";
import { FC, useState } from "react";
import {
    ContentProps,
    ContentType,
    ContentTypeControl,
    DisplayContent,
} from "./Content";

export interface InputContentType extends FC<ContentProps> {}

const InputContent: InputContentType = ({ content, contentType }) => {
    const [type, setContentType] = useState<ContentType>(contentType);
    return (
        <Stack>
            <Group>
                <ContentTypeControl type={type} onTypeChange={setContentType} />
            </Group>
            <DisplayContent type={type} content={content} />
        </Stack>
    );
};

InputContent.displayName = "InputContent";

export default InputContent;
