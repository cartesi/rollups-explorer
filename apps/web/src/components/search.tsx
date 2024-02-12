import { Box, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useEffect, useRef } from "react";
import { useQueryParams } from "../hooks/useQueryParams";

export type SearchProps = {
    onSubmit: (query: string) => void;
};

const Search: React.FC<SearchProps> = ({ onSubmit }) => {
    const { query, updateQueryParams } = useQueryParams();

    const form = useForm({
        initialValues: {
            query: "",
        },
    });
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            updateQueryParams(form.values.query);
            form.onSubmit((values) => onSubmit(values.query))();
            if (inputRef.current) {
                inputRef.current.blur();
            }
        }
    };

    useEffect(() => {
        onSubmit(query);
    }, [query, onSubmit]);

    return (
        <>
            <Box
                w={{ sm: "10%%", lg: "50%" }}
                mb={{ sm: "1rem", lg: "-3.25rem" }}
            >
                <TextInput
                    placeholder="Search by Address / Txn Hash / Index"
                    {...form.getInputProps("query")}
                    onKeyDown={handleKeyDown}
                    ref={inputRef}
                    error={form.errors.query}
                    size="md"
                    data-testid="search-input"
                />
            </Box>
        </>
    );
};

export default Search;
