import { Box, Loader, TextInput } from "@mantine/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { LimitBound, useUrlSearchParams } from "../hooks/useUrlSearchParams";
import { useDebouncedCallback } from "@mantine/hooks";

export type SearchProps = {
    isLoading: boolean;
    onChange: (query: string) => void;
};

const Search: React.FC<SearchProps> = ({ onChange, isLoading }) => {
    const [{ limit, page, query }, updateParams] = useUrlSearchParams();
    const [search, setSearch] = useState<string>(query);
    const lastSearch = useRef(search);
    const isInputValueSyncedWithQuery = useRef(false);

    const onUpdateParams = useDebouncedCallback(
        (page: number, limit: LimitBound, search: string) => {
            updateParams(page, limit, search);
        },
        500,
    );

    const onSearch = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const nextSearch = event.target.value;
            lastSearch.current = nextSearch;

            setSearch(nextSearch);
            onChange(nextSearch);
            onUpdateParams(page, limit, nextSearch);
        },
        [onUpdateParams, page, limit, onChange],
    );

    /**
     * @description Synchronize the search value with the query value once, on page load
     */
    const syncSearchWithQuery = useCallback(() => {
        if (
            !isInputValueSyncedWithQuery.current &&
            lastSearch.current !== query
        ) {
            setSearch(query);
            onChange(query);
            lastSearch.current = query;
            isInputValueSyncedWithQuery.current = true;
        }
    }, [query, onChange]);

    useEffect(() => syncSearchWithQuery(), [syncSearchWithQuery]);

    return (
        <Box w={{ sm: "10%%", lg: "50%" }} mb={{ sm: "1rem", lg: "-3.25rem" }}>
            <TextInput
                placeholder="Search by Address / Txn Hash / Index"
                leftSection={<CiSearch />}
                rightSection={
                    search &&
                    isLoading && (
                        <Loader size={"xs"} aria-label="loader-input" />
                    )
                }
                size="md"
                data-testid="search-input"
                value={search}
                onChange={onSearch}
            />
        </Box>
    );
};

export default Search;
