import type { OutputType } from "@cartesi/viem";
import { Flex, Group, Select } from "@mantine/core";
import { isNotNilOrEmpty } from "ramda-adjunct";
import { type FC } from "react";
import { TbArrowsUpDown, TbCaretDownFilled, TbFilter2 } from "react-icons/tb";
import { useIsSmallDevice } from "../../hooks/useIsSmallDevice";

type ByOutputType = { key: "outputType"; value: OutputType };

export type Filter = { type?: ByOutputType };

const sortOptions = [
    { value: "desc", label: "Descending" },
    { value: "asc", label: "Ascending" },
] as const;

export type Sort = {
    value: (typeof sortOptions)[number]["value"];
};

const outputTypeOptions = [
    { value: "", label: "All" },
    { value: "Notice", label: "Notice" },
    { value: "Voucher", label: "Voucher" },
    {
        value: "DelegateCallVoucher",
        label: "Delegate Call Voucher",
    },
] as const;

export const limits = [10, 30, 50] as const;

export type Limits = (typeof limits)[number];

const itemsPerPageOptions = limits.map((limit) => ({
    value: limit.toString(),
    label: `Show ${limit} items per page`,
}));

export interface OutputSearchProps {
    filter: Filter;
    sort: Sort;
    limit: Limits;
    onFilterChange: (filter: Filter) => void;
    onSortChange: (sort: Sort) => void;
    onLimitChange: (limit: Limits) => void;
}

export const OutputSearch: FC<OutputSearchProps> = ({
    filter,
    sort,
    limit,
    onFilterChange,
    onSortChange,
    onLimitChange,
}) => {
    const { isSmallDevice } = useIsSmallDevice();

    return (
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
                    data={outputTypeOptions}
                    defaultValue={filter.type?.value ?? ""}
                    onChange={(value) => {
                        const newFilter: Filter = isNotNilOrEmpty(value)
                            ? {
                                  type: {
                                      key: "outputType",
                                      value: value as OutputType,
                                  },
                              }
                            : {};
                        onFilterChange(newFilter);
                    }}
                />
                <Select
                    allowDeselect={false}
                    aria-label="Sort by"
                    data={sortOptions}
                    defaultValue={sort.value}
                    w={{ base: "100%", sm: "8rem" }}
                    rightSection={<TbArrowsUpDown />}
                    onChange={(value) => {
                        const newSort =
                            value === "desc"
                                ? { value: "desc" }
                                : { value: "asc" };
                        onSortChange(newSort as Sort);
                    }}
                />
            </Group>
            <Group justify={isSmallDevice ? "flex-end" : "center"}>
                <Select
                    allowDeselect={false}
                    aria-label="Quantity of items per page"
                    w="13rem"
                    data={itemsPerPageOptions}
                    rightSection={<TbCaretDownFilled />}
                    defaultValue={limit.toString()}
                    onChange={(value) => {
                        const newLimit = parseInt(
                            value ?? limits[0].toString(),
                            10,
                        ) as Limits;

                        onLimitChange(newLimit);
                    }}
                />
            </Group>
        </Flex>
    );
};
