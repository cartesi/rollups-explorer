"use client";

import { notifications } from "@mantine/notifications";
import { isFunction } from "ramda-adjunct";
import { type ReactNode, useCallback, useMemo, useRef } from "react";
import {
    validateSpecification,
    VALIDATOR_VERSION,
} from "../transfer/validator";
import {
    type Specification,
    SPECIFICATION_TRANSFER_NAME,
    type SpecificationTransfer as SpecificationTransferModel,
} from "../types";
import { useSpecification } from "./useSpecification";

export const useSpecificationsTransfer = () => {
    const { listSpecifications, addSpecification } = useSpecification();
    const specifications = listSpecifications();
    const version = Number(VALIDATOR_VERSION);
    const specificationExport: SpecificationTransferModel = useMemo(
        () => ({
            name: SPECIFICATION_TRANSFER_NAME,
            version,
            timestamp: new Date().getTime(),
            specifications: specifications ?? [],
        }),
        [specifications, version],
    );
    const resetFileRef = useRef<() => void>(null);

    const specificationExportLink = useMemo(
        () =>
            `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(specificationExport, null, 4),
            )}`,
        [specificationExport],
    );

    const displayAlert = useCallback(
        (message: ReactNode, type: "success" | "error" = "error") => {
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

    const onValidateSuccessfully = useCallback(
        (specificationImport: SpecificationTransferModel) => {
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
                    ),
                );
        },
        [addSpecification, displayAlert],
    );

    const readFileContent = useCallback(
        (file: File) => {
            const fileReader = new FileReader();

            fileReader.onload = () => {
                try {
                    const specificationImport = JSON.parse(
                        fileReader.result as string,
                    );

                    validateSpecification(specificationImport)
                        .then(() => onValidateSuccessfully(specificationImport))
                        .catch((errors: string[]) => {
                            displayAlert(
                                <>
                                    <div>
                                        The imported file is not valid. Please
                                        check the following errors:
                                    </div>
                                    <div>
                                        {errors.map((error) => (
                                            <div key={error}>{error}</div>
                                        ))}
                                    </div>
                                </>,
                            );
                        });
                } catch (err) {
                    console.error(err);
                    displayAlert("Unable to parse specification import.");
                }
            };
            fileReader.onerror = () =>
                displayAlert(
                    "Unable to import file. File content may not be readable.",
                );

            fileReader.readAsText(file);
        },
        [displayAlert, onValidateSuccessfully],
    );

    const onUploadFile = useCallback(
        (file: File | null) => {
            if (file) {
                readFileContent(file);

                if (isFunction(resetFileRef.current)) {
                    resetFileRef.current();
                }
            }
        },
        [readFileContent],
    );

    return useMemo(
        () => ({
            specificationExport,
            specificationExportLink,
            onUploadFile,
            resetFileRef,
        }),
        [
            specificationExport,
            specificationExportLink,
            onUploadFile,
            resetFileRef,
        ],
    );
};

export default useSpecificationsTransfer;
