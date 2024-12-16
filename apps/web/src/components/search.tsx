import { Box, Loader, TextInput } from "@mantine/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { useUrlSearchParams } from "../hooks/useUrlSearchParams";

export type SearchProps = {
    isLoading: boolean;
    onChange: (query: string) => void;
};

const Search: React.FC<SearchProps> = ({ onChange, isLoading }) => {
    const [{ limit, page, query }, updateParams] = useUrlSearchParams();
    const [search, setSearch] = useState<string>(query);
    const lastSearch = useRef(search);

    useEffect(() => {
        if (lastSearch.current !== query) {
            setSearch(query);
            onChange(query);
            lastSearch.current = query;
        }
    }, [query, onChange]);

    const onSearch = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const nextSearch = event.target.value;
            lastSearch.current = nextSearch;

            setSearch(nextSearch);
            updateParams(page, limit, nextSearch);
            onChange(nextSearch);
        },
        [limit, page, onChange, updateParams],
    );

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
