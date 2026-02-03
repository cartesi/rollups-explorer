import type {
    Output as OutputReturn,
    Pagination as QueryPagination,
} from "@cartesi/viem";
import { Group, Pagination, Stack } from "@mantine/core";
import { Activity, type FC } from "react";
import type { DecoderType } from "../types";
import { OutputView } from "./OutputView";

type OutputListProps = {
    decoderType?: DecoderType;
    outputs: OutputReturn[];
    pagination: QueryPagination;
    onPaginationChange?: (newOffset: number) => void;
};

const getActivePage = (offset: number, limit: number) => {
    const safeLimit = limit === 0 ? 1 : limit;
    return offset / safeLimit + 1;
};

export const OutputList: FC<OutputListProps> = ({
    outputs,
    pagination,
    decoderType = "raw",
    onPaginationChange,
}) => {
    const totalPages = Math.ceil(pagination.totalCount / pagination.limit);
    const activePage = getActivePage(pagination.offset, pagination.limit);
    const hasMoreThanOnePage = totalPages > 1;

    return (
        <Stack id="output-list" gap={0}>
            <Activity mode={hasMoreThanOnePage ? "visible" : "hidden"}>
                <Group justify="flex-end">
                    <Pagination
                        total={totalPages}
                        value={activePage}
                        onChange={(newPageNumber) => {
                            if (newPageNumber !== activePage) {
                                onPaginationChange?.(
                                    newPageNumber * pagination.limit -
                                        pagination.limit,
                                );
                            }
                        }}
                    />
                </Group>
            </Activity>
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
