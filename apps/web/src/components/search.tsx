import { Box, Loader, TextInput } from "@mantine/core";
import React, { useCallback, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { useQueryParams } from "../hooks/useQueryParams";
export type SearchProps = {
    isLoading: boolean;
    onChange: (query: string) => void;
};

const Search: React.FC<SearchProps> = ({ onChange, isLoading }) => {
    const { query, updateQueryParams } = useQueryParams();
    const [keyword, setKeyword] = useState<string>("");

    useEffect(() => {
        updateQueryParams(keyword);
        onChange(keyword);
    }, [query, onChange, keyword, updateQueryParams]);

    const onSearch = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setKeyword(event.target.value);
        },
        [],
    );

    return (
        <Box w={{ sm: "10%%", lg: "50%" }} mb={{ sm: "1rem", lg: "-3.25rem" }}>
            <TextInput
                placeholder="Search by Address / Txn Hash / Index"
                leftSection={<CiSearch />}
                rightSection={
                    keyword &&
                    isLoading && (
                        <Loader size={"xs"} aria-label="loader-input" />
                    )
                }
                size="md"
                data-testid="search-input"
                value={keyword}
                onChange={onSearch}
            />
        </Box>
    );
};

export default Search;
