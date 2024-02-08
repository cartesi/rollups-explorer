import { Box, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useEffect, useRef } from "react";
import { useQueryParams } from "../hooks/useQueryParams";

export type SearchProps = {
    onSubmit: (query: string) => void;
};

const Search: React.FC<SearchProps> = ({ onSubmit }) => {
    const [queryParam, updateQueryParams] = useQueryParams();

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
        onSubmit(queryParam);
    }, [queryParam, onSubmit]);

    return (
        <>
            <Box w={{ sm: "10%%", lg: "50%" }} mt={"sm"}>
                <TextInput
                    placeholder="Search by Address / Txn Hash / Index"
                    {...form.getInputProps("query")}
                    onKeyDown={handleKeyDown}
                    ref={inputRef}
                    error={form.errors.query}
                    size="md"
                />
            </Box>
        </>
    );
};

export default Search;
