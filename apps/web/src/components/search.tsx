import { Loader, TextInput, TextInputProps } from "@mantine/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { TbSearch } from "react-icons/tb";
import { LimitBound, useUrlSearchParams } from "../hooks/useUrlSearchParams";
import { useDebouncedCallback } from "@mantine/hooks";

export interface SearchProps extends Omit<TextInputProps, "onChange"> {
    placeholder?: string;
    isLoading: boolean;
    onChange: (query: string) => void;
}

const Search: React.FC<SearchProps> = (props) => {
    const {
        placeholder = "Search by Address / Txn Hash / Index",
        onChange,
        isLoading,
        ...restProps
    } = props;
    const [{ limit, page, query, version }, updateParams] =
        useUrlSearchParams();
    const [search, setSearch] = useState<string>(query);
    const lastSearch = useRef(search);
    const isInputValueSyncedWithQuery = useRef(false);

    const onUpdateParams = useDebouncedCallback(
        (page: number, limit: LimitBound, search: string, version: string) => {
            updateParams(page, limit, search, version);
        },
        500,
    );

    const onSearch = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const nextSearch = event.target.value;
            lastSearch.current = nextSearch;

            setSearch(nextSearch);
            onChange(nextSearch);
            onUpdateParams(page, limit, nextSearch, version);
        },
        [onChange, onUpdateParams, page, limit, version],
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
        <TextInput
            {...restProps}
            placeholder={placeholder}
            leftSection={<TbSearch />}
            rightSection={
                search &&
                isLoading && <Loader size={"xs"} aria-label="loader-input" />
            }
            size="md"
            data-testid="search-input"
            value={search}
            onChange={onSearch}
        />
    );
};

export default Search;
