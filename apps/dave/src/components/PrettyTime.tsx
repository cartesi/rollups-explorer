import { Button, Text, type TextProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import prettyMillis, { type Options } from "pretty-ms";
import { Activity, type FC } from "react";

interface PrettyTimeProps {
    milliseconds: number;
    options?: Options;
    displayTimestampUTC?: boolean;
    size?: TextProps["size"];
}

const defaultOpts = {
    unitCount: 2,
    secondsDecimalDigits: 0,
    verbose: true,
};

export const PrettyTime: FC<PrettyTimeProps> = ({
    milliseconds,
    options,
    displayTimestampUTC = false,
    size,
}) => {
    const opts: Options = Object.assign({ ...defaultOpts }, options);
    const [asTimestamp, handlers] = useDisclosure(false);
    const text = asTimestamp
        ? new Date(milliseconds).toISOString()
        : `${prettyMillis(Date.now() - milliseconds, opts)} ago`;

    return (
        <>
            <Activity mode={displayTimestampUTC ? "visible" : "hidden"}>
                <Button
                    variant="transparent"
                    px={0}
                    onClick={() => {
                        if (displayTimestampUTC) handlers.toggle();
                    }}
                >
                    {text}
                </Button>
            </Activity>
            <Activity mode={!displayTimestampUTC ? "visible" : "hidden"}>
                <Text size={size}>{text}</Text>
            </Activity>
        </>
    );
};
