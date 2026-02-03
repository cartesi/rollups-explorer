import type { GetReportReturnType } from "@cartesi/viem";
import { Fieldset, Spoiler, Text } from "@mantine/core";
import { useEffect, useRef, type FC } from "react";
import { getDecoder } from "../../lib/decoders";
import type { DecoderType } from "../types";

interface ReportViewProps {
    displayAs?: DecoderType;
    report: GetReportReturnType;
}

export const ReportView: FC<ReportViewProps> = ({
    displayAs = "raw",
    report,
}) => {
    const decoderFn = getDecoder(displayAs);
    const ref = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (ref.current !== null) {
            ref.current.blur();
        }
    });

    return (
        <Fieldset>
            <Spoiler hideLabel="Show less" showLabel="Show more" maxHeight={80}>
                <Text style={{ wordBreak: "break-all" }}>
                    {decoderFn(report.rawData)}
                </Text>
            </Spoiler>
        </Fieldset>
    );
};
