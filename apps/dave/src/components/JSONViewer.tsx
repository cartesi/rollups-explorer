import { JsonInput, type JsonInputProps } from "@mantine/core";
import { isString } from "ramda-adjunct";
import type { FC } from "react";
import { stringifyContent } from "./specification/utils";

interface JSONViewerProps extends Pick<
    JsonInputProps,
    "variant" | "size" | "placeholder" | "id"
> {
    content: string | { [key: string]: unknown };
}

const JSONViewer: FC<JSONViewerProps> = ({
    content,
    variant = "filled",
    size = "md",
    id,
    placeholder = "No content defined",
}) => {
    const value = isString(content) ? content : stringifyContent(content);
    return (
        <JsonInput
            id={id}
            variant={variant}
            size={size}
            autoFocus
            autosize
            defaultValue={value}
            onFocus={(evt) => evt.currentTarget.blur()}
            placeholder={placeholder}
            formatOnBlur
        />
    );
};

export default JSONViewer;
