"use client";
import {
    ActionIcon,
    Box,
    Button,
    Group,
    LoadingOverlay,
    Skeleton,
    Stack,
    Text,
    VisuallyHidden,
    useMantineTheme,
} from "@mantine/core";
import { allPass, complement, isEmpty, isNotNil } from "ramda";
import { isFunction } from "ramda-adjunct";
import { FC, FunctionComponent, useState } from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";
import {
    ContentProps,
    ContentType,
    ContentTypeControl,
    DisplayContent,
} from "./Content";

export type ContentState = "LOADING" | "FAIL" | "FULFILLED";
export type OutputType = "VoucherContent" | "ReportContent" | "NoticeContent";

export interface Paging {
    total: number;
    onNextPage: () => void;
    onPreviousPage: () => void;
}

export interface PageableContentProps extends ContentProps {
    isLoading?: boolean;
    isConnected?: boolean;
    onConnect?: () => void;
    paging?: Paging;
    outputType: OutputType;
}

const isNotNilOrEmpty = allPass([complement(isEmpty), isNotNil]);

interface ConnectProps {
    onConnect: () => void;
}

const Connect: FC<ConnectProps> = ({ onConnect }) => {
    return (
        <Stack>
            <Group m={0} p={0}>
                <Skeleton animate={false} height={50} circle my="sm" />
                <Skeleton animate={false} height={50} circle my="sm" />
                <Skeleton animate={false} height={50} circle my="sm" />
            </Group>
            <Skeleton animate={false} height={8} radius="xl" />
            <Skeleton animate={false} height={8} mt={6} radius="xl" />
            <Skeleton
                animate={false}
                height={8}
                mt={6}
                width="70%"
                radius="xl"
            />
            <Group justify="center">
                <Button mr="auto" onClick={() => onConnect()}>
                    Connect
                </Button>
            </Group>
        </Stack>
    );
};

export const PageableContent: FunctionComponent<PageableContentProps> = ({
    isConnected = true,
    onConnect = () => {
        throw new Error("OnConnect callback not defined");
    },
    isLoading,
    content,
    contentType,
    paging,
    onContentTypeChange,
    children,
    childrenPosition,
    outputType,
    topPosition,
    middlePosition,
    additionalControls,
}) => {
    const theme = useMantineTheme();
    const [type, setContentType] = useState<ContentType>(contentType);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const hasPaging = paging?.total && paging.total > 1;
    const hasContent = isNotNilOrEmpty(content);
    const position = childrenPosition ?? "bottom";
    const hasChildren = isNotNilOrEmpty(children);

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
                data-testid={`loading-overlay-${outputType.toLowerCase()}`}
                visible={isLoading}
                zIndex={1000}
                overlayProps={{ blur: 2 }}
                loaderProps={{ color: theme.primaryColor, type: "oval" }}
            />
            {!isConnected && <Connect onConnect={onConnect} />}

            {isConnected && (
                <Stack h="100%" justify="center">
                    {position === "top" && hasChildren && children}

                    {isNotNilOrEmpty(topPosition) && topPosition}

                    {hasContent || isLoading ? (
                        <>
                            <Group gap={1} justify="space-between">
                                <ContentTypeControl
                                    type={type}
                                    additionalControls={additionalControls}
                                    onTypeChange={(contentType) => {
                                        setContentType(contentType);
                                        isFunction(onContentTypeChange) &&
                                            onContentTypeChange(contentType);
                                    }}
                                />
                                {hasPaging && (
                                    <Group gap={3} align="end">
                                        <ActionIcon
                                            variant="subtle"
                                            onClick={prevPage}
                                            disabled={pageNumber === 1}
                                            aria-label="Button to load the previous content"
                                        >
                                            <VisuallyHidden>
                                                Previous content
                                            </VisuallyHidden>
                                            <TbChevronLeft />
                                        </ActionIcon>
                                        <Text>
                                            {pageNumber} of {paging.total}
                                        </Text>
                                        <ActionIcon
                                            variant="subtle"
                                            onClick={nextPage}
                                            disabled={
                                                pageNumber === paging.total
                                            }
                                            aria-label="Button to load the next content"
                                        >
                                            <VisuallyHidden>
                                                Next content
                                            </VisuallyHidden>
                                            <TbChevronRight />
                                        </ActionIcon>
                                    </Group>
                                )}
                            </Group>
                            {position === "middle" && hasChildren && children}
                            {isNotNilOrEmpty(middlePosition) && middlePosition}
                            <DisplayContent type={type} content={content} />
                        </>
                    ) : (
                        <Group justify="center" align="center">
                            <Text c="dimmed">No content to be displayed</Text>
                        </Group>
                    )}
                    {position === "bottom" && hasChildren && children}
                </Stack>
            )}
        </Box>
    );
};
