import type { Output, Pagination } from "@cartesi/viem";
import { Stack } from "@mantine/core";
import { type FC } from "react";
import { QueryPagination } from "../QueryPagination";
import type { DecoderType } from "../types";
import { OutputView } from "./OutputView";

type OutputListProps = {
    decoderType?: DecoderType;
    outputs: Output[];
    pagination: Pagination;
    application: string;
    onPaginationChange?: (newOffset: number) => void;
};

export const OutputList: FC<OutputListProps> = ({
    outputs,
    pagination,
    decoderType = "raw",
    onPaginationChange,
    application,
}) => {
    return (
        <Stack id="output-list" gap={0}>
            <QueryPagination
                pagination={pagination}
                onPaginationChange={onPaginationChange}
            />
            <Stack id={`${application}-output-list-items`}>
                {outputs.map((output) => (
                    <OutputView
                        application={application}
                        key={`${output.epochIndex}-${output.inputIndex}-${output.index}`}
                        output={output}
                        displayAs={decoderType}
                    />
                ))}
            </Stack>
        </Stack>
    );
};
