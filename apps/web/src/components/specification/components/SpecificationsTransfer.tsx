"use client";

import React from "react";
import { ActionIcon, Box, FileButton, Group, Tooltip } from "@mantine/core";
import { TbDownload, TbUpload } from "react-icons/tb";
import { useSpecificationsTransfer } from "../hooks/useSpecificationsTransfer";

export const SpecificationsTransfer = () => {
    const { resetFileRef, specificationExportLink, onUploadFile } =
        useSpecificationsTransfer();

    return (
        <Group>
            <Tooltip label="Export specifications">
                <ActionIcon
                    component="a"
                    href={specificationExportLink}
                    download="cartesiscan_specifications_export.json"
                    variant="light"
                    size="lg"
                    data-testid="specification-export-link"
                >
                    <TbDownload />
                </ActionIcon>
            </Tooltip>

            <Tooltip label="Import specifications">
                <Box>
                    <FileButton
                        resetRef={resetFileRef}
                        accept="application/json"
                        data-testid="import-specification-button"
                        onChange={onUploadFile}
                    >
                        {(props) => (
                            <ActionIcon variant="light" size="lg" {...props}>
                                <TbUpload />
                            </ActionIcon>
                        )}
                    </FileButton>
                </Box>
            </Tooltip>
        </Group>
    );
};
