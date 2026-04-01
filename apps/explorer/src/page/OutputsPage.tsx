"use client";
import type { OutputType } from "@cartesi/viem";
import { Flex, Group, Select, Stack } from "@mantine/core";
import { isEmpty } from "ramda";
import { useMemo, useState, type FC } from "react";
import {
    TbArrowsUpDown,
    TbCaretDownFilled,
    TbFilter2,
    TbMail,
} from "react-icons/tb";
import PageTitle from "../components/layout/PageTitle";
import { OutputContainer } from "../components/output/OutputContainer";
import { useIsSmallDevice } from "../hooks/useIsSmallDevice";

type ByOutputType = { key: "outputType"; value: OutputType };

type Filter = { type?: ByOutputType };

type Sort = {
    descending?: boolean;
};

const outputTypeOptions = [
    { value: "", label: "All" },
    { value: "Notice", label: "Notice" },
    { value: "Voucher", label: "Voucher" },
    {
        value: "DelegateCallVoucher",
        label: "Delegated Call Voucher",
    },
] as const;

const limits = [10, 30, 50] as const;
const sortOptions = [
    { value: "true", label: "Descending" },
    { value: "false", label: "Ascending" },
] as const;

type Limits = (typeof limits)[number];

type Props = {
    application: string;
    sort?: Sort;
    filter?: Filter;
    limit?: number;
    offset?: number;
};

export const OutputsPage: FC<Props> = ({
    application,
    sort = { descending: true },
    filter = {},
    limit = 10,
    offset = 0,
}) => {
    const { isSmallDevice } = useIsSmallDevice();
    const [sortBy, setSortBy] = useState(sort);
    const [filterBy, setFilterBy] = useState(filter);
    const [itemsPerPage, setItemsPerPage] = useState(limit);

    const itemsPerPageOptions = useMemo(() => {
        return limits.map((limit) => ({
            value: limit.toString(),
            label: `Show ${limit} items per page`,
        }));
    }, []);

    return (
        <Stack gap="xl">
            <PageTitle Icon={TbMail} title={`Outputs`} />

            <Stack>
                <Flex
                    direction={{ base: "column", sm: "row" }}
                    justify={isSmallDevice ? "flex-start" : "space-between"}
                    gap="md"
                >
                    <Group>
                        <Select
                            allowDeselect={false}
                            aria-label="Filter by"
                            placeholder="Select output type"
                            rightSection={<TbFilter2 />}
                            w={{ base: "100%", sm: "12rem" }}
                            value={filterBy.type?.value ?? ""}
                            data={outputTypeOptions}
                            defaultValue={""}
                            onChange={(value) => {
                                const newFilter: Filter = isEmpty(value)
                                    ? {}
                                    : {
                                          type: {
                                              key: "outputType",
                                              value: value as OutputType,
                                          },
                                      };
                                setFilterBy(newFilter);
                            }}
                        />
                        <Select
                            allowDeselect={false}
                            aria-label="Sort by"
                            value={sortBy.descending ? "true" : "false"}
                            data={sortOptions}
                            defaultValue={"true"}
                            w={{ base: "100%", sm: "8rem" }}
                            rightSection={<TbArrowsUpDown />}
                            onChange={(value) => {
                                setSortBy(
                                    value === "true"
                                        ? { descending: true }
                                        : { descending: false },
                                );
                            }}
                        />
                    </Group>
                    <Group justify={isSmallDevice ? "flex-end" : "center"}>
                        <Select
                            allowDeselect={false}
                            aria-label="Quantity of items per page"
                            w="13rem"
                            data={itemsPerPageOptions}
                            value={itemsPerPage.toString()}
                            rightSection={<TbCaretDownFilled />}
                            defaultValue={"50"}
                            onChange={(value) => {
                                const newLimit = parseInt(
                                    value ?? limits[0].toString(),
                                    10,
                                ) as Limits;

                                setItemsPerPage(newLimit);
                            }}
                        />
                    </Group>
                </Flex>
                <OutputContainer
                    application={application}
                    offset={offset}
                    limit={itemsPerPage}
                    descending={sortBy.descending}
                    outputType={filterBy.type?.value}
                />
            </Stack>
        </Stack>
    );
};
