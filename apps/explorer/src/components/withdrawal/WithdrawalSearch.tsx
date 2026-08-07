import { Flex, Group, Select, TextInput } from "@mantine/core";
import { useEffect, useState, type FC } from "react";
import { TbArrowsUpDown, TbCaretDownFilled, TbHash } from "react-icons/tb";
import { useIsSmallDevice } from "../../hooks/useIsSmallDevice";
import {
    withdrawalSearchLimits,
    type WithdrawalSearchLimit,
    type WithdrawalSearchSort,
} from "./lib/withdrawalSearchUtils";

const sortOptions = [
    { value: "desc", label: "Descending" },
    { value: "asc", label: "Ascending" },
] as const;

const itemsPerPageOptions = withdrawalSearchLimits.map((limit) => ({
    value: limit.toString(),
    label: `Show ${limit} items per page`,
}));

type WithdrawalSearchProps = {
    accountIndex?: bigint;
    sort: WithdrawalSearchSort;
    limit: WithdrawalSearchLimit;
    onAccountIndexChange: (accountIndex: string) => void;
    onSortChange: (sort: WithdrawalSearchSort) => void;
    onLimitChange: (limit: WithdrawalSearchLimit) => void;
};

export const WithdrawalSearch: FC<WithdrawalSearchProps> = ({
    accountIndex,
    sort,
    limit,
    onAccountIndexChange,
    onSortChange,
    onLimitChange,
}) => {
    const { isSmallDevice } = useIsSmallDevice();
    const [accountIndexValue, setAccountIndexValue] = useState(
        accountIndex?.toString() ?? "",
    );

    useEffect(() => {
        setAccountIndexValue(accountIndex?.toString() ?? "");
    }, [accountIndex]);

    return (
        <Flex
            direction={{ base: "column", sm: "row" }}
            justify={isSmallDevice ? "flex-start" : "space-between"}
            gap="md"
        >
            <Group>
                <TextInput
                    aria-label="Account index"
                    inputMode="numeric"
                    placeholder="Filter by account index"
                    rightSection={<TbHash />}
                    value={accountIndexValue}
                    onChange={(event) => {
                        const newAccountIndex = event.currentTarget.value;
                        setAccountIndexValue(newAccountIndex);
                        onAccountIndexChange(newAccountIndex);
                    }}
                />
                <Select
                    allowDeselect={false}
                    aria-label="Sort by"
                    data={sortOptions}
                    rightSection={<TbArrowsUpDown />}
                    value={sort.value}
                    w={{ base: "100%", sm: "8rem" }}
                    onChange={(value) => {
                        onSortChange({
                            value: value === "desc" ? "desc" : "asc",
                        });
                    }}
                />
            </Group>
            <Group justify={isSmallDevice ? "flex-end" : "center"}>
                <Select
                    allowDeselect={false}
                    aria-label="Quantity of items per page"
                    data={itemsPerPageOptions}
                    rightSection={<TbCaretDownFilled />}
                    value={limit.toString()}
                    w="13rem"
                    onChange={(value) => {
                        const selectedLimit = withdrawalSearchLimits.find(
                            (allowedLimit) => allowedLimit.toString() === value,
                        );
                        onLimitChange(
                            selectedLimit ?? withdrawalSearchLimits[0],
                        );
                    }}
                />
            </Group>
        </Flex>
    );
};
