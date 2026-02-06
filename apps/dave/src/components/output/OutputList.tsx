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
    onPaginationChange?: (newOffset: number) => void;
};

export const OutputList: FC<OutputListProps> = ({
    outputs,
    pagination,
    decoderType = "raw",
    onPaginationChange,
}) => {
    return (
        <Stack id="output-list" gap={0}>
            <QueryPagination
                pagination={pagination}
                onPaginationChange={onPaginationChange}
            />
            {outputs.map((output) => (
                <OutputView
                    key={`${output.epochIndex}-${output.inputIndex}-${output.index}`}
                    output={output}
                    displayAs={decoderType}
                />
            ))}
        </Stack>
    );
};
