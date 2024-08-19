"use client";

import { ReactNode, useCallback, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import { useSpecification } from "./useSpecification";
import {
    Specification,
    SpecificationTransfer as SpecificationTransferModel,
    ValidationType,
} from "../types";
import { validateSpecificationImport } from "../form/validations";
import { getSpecificationVersion } from "../utils";

export const useSpecificationsTransfer = () => {
    const { listSpecifications, addSpecification } = useSpecification();
    const specifications = listSpecifications();
    const version = getSpecificationVersion();
    const name = "cartesiscan_specifications_export";
    const specificationExport: SpecificationTransferModel = useMemo(
        () => ({
            name,
            version,
            timestamp: new Date().getTime(),
            specifications: specifications ?? [],
        }),
        [specifications, version],
    );

    const exportLink = useMemo(
        () =>
            `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(specificationExport, null, 4),
            )}`,
        [specificationExport],
    );

    const displayAlert = useCallback(
        (message: ReactNode, type: ValidationType = "error") => {
            const isSuccess = type === "success";
            notifications.show({
                message,
                color: isSuccess ? "green" : "red",
                withBorder: true,
                autoClose: isSuccess,
            });
        },
        [],
    );

    const onComplete = useCallback(
        (
            message: ReactNode,
            type: ValidationType,
            specificationImport: SpecificationTransferModel,
        ) => {
            if (type === "error") {
                return displayAlert(message);
            }

            Promise.all(
                specificationImport.specifications.map(
                    (specification: Specification) =>
                        new Promise((resolve, reject) => {
                            setTimeout(() =>
                                addSpecification(specification, {
                                    onSuccess: () => resolve(undefined),
                                    onFailure: (err) => reject(err),
                                }),
                            );
                        }),
                ),
            )
                .then(() =>
                    displayAlert(
                        "Specifications were imported successfully.",
                        "success",
                    ),
                )
                .catch((err) =>
                    displayAlert(
                        `Unable to import specifications. Error is: ${
                            err?.message ?? err
                        }`,
                        "error",
                    ),
                );
        },
        [addSpecification, displayAlert],
    );

    const onFileLoad = useCallback(
        (fileContents: string) => {
            try {
                const specificationImport = JSON.parse(fileContents);

                validateSpecificationImport(
                    specificationImport,
                    version,
                    name,
                    (message: ReactNode, type: ValidationType = "error") => {
                        onComplete(message, type, specificationImport);
                    },
                );
            } catch (err) {
                displayAlert("Unable to parse specification import.");
            }
        },
        [displayAlert, onComplete, version],
    );

    const readFileContent = useCallback(
        (file: File) => {
            const fileReader = new FileReader();

            fileReader.onload = () => onFileLoad(fileReader.result as string);
            fileReader.onerror = () =>
                displayAlert(
                    "Unable to import file. File content may not be readable.",
                );

            fileReader.readAsText(file);
        },
        [onFileLoad, displayAlert],
    );

    const onChangeFile = useCallback(
        (file: File | null) => {
            if (file) {
                readFileContent(file);
            }
        },
        [readFileContent],
    );

    return useMemo(
        () => ({
            exportLink,
            onChangeFile,
        }),
        [exportLink, onChangeFile],
    );
};
