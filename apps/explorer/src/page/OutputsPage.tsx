"use client";
import type { Application, Output, Pagination } from "@cartesi/viem";
import { Stack } from "@mantine/core";
import { type FC } from "react";
import { TbMail } from "react-icons/tb";
import CenteredText from "../components/CenteredText";
import { QueryPagination } from "../components/QueryPagination";
import PageTitle from "../components/layout/PageTitle";
import { OutputCard } from "../components/output/OutputCard";
import {
    OutputSearch,
    type Filter,
    type Limits,
    type Sort,
} from "../components/output/OutputSearch";
import { outputSearchUrlQueryName } from "../components/output/lib/outputSearchUtils";
import useUpdateQueryString from "../hooks/useUpdateQueryString";

type Props = {
    application: Application;
    outputs: {
        data: Output[];
        isLoading: boolean;
    };
    pagination: Pagination;
    sort?: Sort;
    filter?: Filter;
    limit?: Limits;
};

export const OutputsPage: FC<Props> = ({
    application,
    outputs,
    pagination,
    sort = { value: "desc" },
    filter = {},
    limit = 10,
}) => {
    const [updateUrlQueryString] = useUpdateQueryString();

    return (
        <Stack gap="xl">
            <PageTitle Icon={TbMail} title={`Outputs`} />

            <Stack>
                <OutputSearch
                    filter={filter}
                    sort={sort}
                    limit={limit}
                    onFilterChange={(newFilter) => {
                        updateUrlQueryString([
                            {
                                name: outputSearchUrlQueryName.filterType,
                                value: newFilter.type?.key ?? "",
                            },
                            {
                                name: outputSearchUrlQueryName.filterValue,
                                value: newFilter.type?.value ?? "",
                            },
                            {
                                name: outputSearchUrlQueryName.offsetValue,
                                value: "0",
                            },
                        ]);
                    }}
                    onSortChange={(newSort) => {
                        updateUrlQueryString([
                            {
                                name: outputSearchUrlQueryName.sortValue,
                                value: newSort.value ?? "",
                            },
                            {
                                name: outputSearchUrlQueryName.offsetValue,
                                value: "0",
                            },
                        ]);
                    }}
                    onLimitChange={(newLimit) => {
                        updateUrlQueryString([
                            {
                                name: outputSearchUrlQueryName.limitValue,
                                value: newLimit.toString(),
                            },
                            {
                                name: outputSearchUrlQueryName.offsetValue,
                                value: "0",
                            },
                        ]);
                    }}
                />

                <Stack gap={0}>
                    <QueryPagination
                        pagination={pagination}
                        onPaginationChange={(newOffset) => {
                            updateUrlQueryString([
                                {
                                    name: outputSearchUrlQueryName.offsetValue,
                                    value: newOffset.toString(),
                                },
                            ]);
                        }}
                    />

                    <Stack
                        id={`${application.applicationAddress}-output-list-items`}
                        pt="lg"
                    >
                        {outputs.isLoading ? (
                            <CenteredText
                                text="Loading outputs..."
                                cardProps={{ mt: "xl" }}
                                textProps={{ size: "lg" }}
                            />
                        ) : outputs.data.length === 0 ? (
                            <CenteredText
                                text="No outputs found"
                                cardProps={{ mt: "xl" }}
                                textProps={{ size: "lg" }}
                            />
                        ) : (
                            outputs.data.map((output) => (
                                <OutputCard
                                    key={`output-${output.index}`}
                                    output={output}
                                    application={application}
                                />
                            ))
                        )}
                    </Stack>
                </Stack>
            </Stack>
        </Stack>
    );
};
