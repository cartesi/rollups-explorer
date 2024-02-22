import { Box, Loader, TextInput } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import React, { useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useQueryParams } from "../hooks/useQueryParams";
export type SearchProps = {
    isLoading: Boolean;
    onChange: (query: string) => void;
};

const Search: React.FC<SearchProps> = ({ onChange, isLoading }) => {
    const { query, updateQueryParams } = useQueryParams();
    const [keyword, setKeyword] = useDebouncedState("", 500);
    useEffect(() => {
        updateQueryParams(keyword);
        onChange(keyword);
    }, [query, onChange, keyword]);

    return (
        <Box w={{ sm: "10%%", lg: "50%" }} mb={{ sm: "1rem", lg: "-3.25rem" }}>
            <TextInput
                placeholder="Search by Address / Txn Hash / Index"
                leftSection={<CiSearch />}
                rightSection={keyword && isLoading && <Loader size={"xs"} />}
                size="md"
                data-testid="search-input"
                defaultValue={query}
                onChange={(event) => {
                    setKeyword(event.target.value);
                }}
            />
        </Box>
    );
};

export default Search;
