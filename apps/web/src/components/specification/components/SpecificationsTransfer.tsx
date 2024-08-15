"use client";

import React, { useCallback, useState } from "react";
import { ActionIcon, FileButton, Group, Tooltip } from "@mantine/core";
import { TbDownload, TbUpload } from "react-icons/tb";
import { useSpecification } from "../hooks/useSpecification";
import { Specification } from "../types";

interface SpecificationExport {
    name: "cartesiscan_specifications_export";
    version: number;
    timestamp: number;
    specifications: Specification[];
}

export const SpecificationTransfer = () => {
    const { listSpecifications } = useSpecification();
    const specifications = listSpecifications();
    const [file, setFile] = useState<File | null>(null);
    const specificationExport: SpecificationExport = {
        name: "cartesiscan_specifications_export",
        version: specifications?.[0].version ?? 1,
        timestamp: new Date().getTime(),
        specifications: specifications ?? [],
    };

    const exportLink = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(specificationExport, null, 4),
    )}`;

    const onChangeFile = useCallback((file: File | null) => {
        console.log("onChangeFile::", file);
        // TODO: Parse file contents and validate the json
        setFile(file);
    }, []);

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
                <FileButton onChange={onChangeFile} accept="application/json">
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
