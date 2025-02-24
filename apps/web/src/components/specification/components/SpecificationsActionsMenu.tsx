"use client";

import React from "react";
import {
    ActionIcon,
    Box,
    FileButton,
    Group,
    Menu,
    Tooltip,
} from "@mantine/core";
import { TbDotsVertical, TbDownload, TbUpload } from "react-icons/tb";
import { useSpecificationsTransfer } from "../hooks/useSpecificationsTransfer";

export const SpecificationsActionsMenu = () => {
    const { resetFileRef, specificationExportLink, onUploadFile } =
        useSpecificationsTransfer();

    return (
        <Tooltip label="Actions">
            <Group data-testid="specifications-actions-menu">
                <Menu shadow="md" width={220} closeOnItemClick={false}>
                    <Menu.Target>
                        <ActionIcon
                            size="lg"
                            data-testid="specifications-actions-menu-target"
                        >
                            <TbDotsVertical />
                        </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<TbDownload />}
                            component="a"
                            href={specificationExportLink}
                            download="cartesiscan_specifications_export.json"
                            data-testid="specification-export-link"
                        >
                            Download specifications
                        </Menu.Item>
                        <Menu.Item leftSection={<TbUpload />}>
                            <FileButton
                                resetRef={resetFileRef}
                                accept="application/json"
                                data-testid="import-specification-button"
                                onChange={onUploadFile}
                            >
                                {(props) => (
                                    <Box
                                        style={{
                                            fontSize:
                                                "var(--mantine-font-size-sm)",
                                        }}
                                        {...props}
                                    >
                                        Upload specifications
                                    </Box>
                                )}
                            </FileButton>
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </Tooltip>
    );
};
