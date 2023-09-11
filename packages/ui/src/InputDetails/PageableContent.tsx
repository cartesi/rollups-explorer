"use client";
import {
    ActionIcon,
    Box,
    Group,
    LoadingOverlay,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { allPass, complement, isEmpty, isNotNil } from "ramda";
import { FunctionComponent, useState } from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";
import {
    ContentProps,
    ContentType,
    ContentTypeControl,
    DisplayContent,
} from "./Content";

export type ContentState = "LOADING" | "FAIL" | "FULFILLED";

export interface Paging {
    total: number;
    onNextPage: () => void;
    onPreviousPage: () => void;
}

export interface PageableContentProps extends ContentProps {
    isLoading?: boolean;
    paging?: Paging;
}

const isNotNilOrEmpty = allPass([complement(isEmpty), isNotNil]);

export const PageableContent: FunctionComponent<PageableContentProps> = ({
    isLoading,
    content,
    contentType,
    paging,
}) => {
    const theme = useMantineTheme();
    const [type, setContentType] = useState<ContentType>(contentType);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const hasPaging = paging?.total && paging.total > 1;
    const hasContent = isNotNilOrEmpty(content);

    const nextPage = () => {
        if (paging?.total) {
            if (pageNumber < paging.total) {
                setPageNumber((c) => c + 1);
                paging?.onNextPage();
            }
        }
    };

    const prevPage = () => {
        if (paging?.total) {
            if (pageNumber > 1) {
                setPageNumber((c) => c - 1);
                paging?.onPreviousPage();
            }
        }
    };

    return (
        <Box pos="relative" h="100%">
            <LoadingOverlay
                visible={isLoading}
                zIndex={1000}
                overlayProps={{ blur: 2 }}
                loaderProps={{ color: theme.primaryColor, type: "oval" }}
            />
            <Stack h="100%" justify="center">
                {hasContent || isLoading ? (
                    <>
                        <Group gap={1} justify="space-between">
                            <ContentTypeControl
                                type={type}
                                onTypeChange={setContentType}
                            />
                            {hasPaging && (
                                <Group gap={3} align="end">
                                    <ActionIcon
                                        variant="subtle"
                                        onClick={prevPage}
                                        disabled={pageNumber === 1}
                                        aria-label="Button to load the previous content"
                                    >
                                        <TbChevronLeft />
                                    </ActionIcon>
                                    <Text>
                                        {pageNumber} of {paging.total}
                                    </Text>
                                    <ActionIcon
                                        variant="subtle"
                                        onClick={nextPage}
                                        disabled={pageNumber === paging.total}
                                        aria-label="Button to load the next content"
                                    >
                                        <TbChevronRight />
                                    </ActionIcon>
                                </Group>
                            )}
                        </Group>
                        <DisplayContent type={type} content={content} />
                    </>
                ) : (
                    <Group justify="center" align="center">
                        <Text c="dimmed">No content to be displayed</Text>
                    </Group>
                )}
            </Stack>
        </Box>
    );
};
