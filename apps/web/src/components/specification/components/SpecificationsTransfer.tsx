"use client";

import React from "react";
import { ActionIcon, FileButton, Group, Tooltip } from "@mantine/core";
import { TbDownload, TbUpload } from "react-icons/tb";
import { useSpecificationsTransfer } from "../hooks/useSpecificationsTransfer";

export const SpecificationTransfer = () => {
    const { onChangeFile, exportLink } = useSpecificationsTransfer();

    return (
        <Group>
            <Tooltip label="Export specifications">
                <ActionIcon
                    component="a"
                    href={exportLink}
                    download="cartesiscan_specifications_export.json"
                    variant="light"
                    size="lg"
                >
                    <TbDownload />
                </ActionIcon>
            </Tooltip>

            <Tooltip label="Import specifications">
                <FileButton accept="application/json" onChange={onChangeFile}>
                    {(props) => (
                        <ActionIcon variant="light" size="lg" {...props}>
                            <TbUpload />
                        </ActionIcon>
                    )}
                </FileButton>
            </Tooltip>
        </Group>
    );
};
