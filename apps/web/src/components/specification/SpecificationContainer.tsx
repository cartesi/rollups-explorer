"use client";
import { Center, Loader } from "@mantine/core";
import { useRouter } from "next/navigation";
import { isNotNilOrEmpty } from "ramda-adjunct";
import { FC, useCallback } from "react";
import {
    SpecificationFormView,
    SpecificationFormViewOnSuccess,
} from "./SpecificationFormView";
import { EditSpecificationNotFound } from "./components/EditSpecificationNotFound";
import { useSpecification } from "./hooks/useSpecification";
import { Specification } from "./types";

interface ContainerProps {
    specificationId?: Specification["id"];
}

export const SpecificationContainer: FC<ContainerProps> = ({
    specificationId,
}) => {
    const router = useRouter();
    const { getSpecification, fetching } = useSpecification();
    const foundSpecification = getSpecification(specificationId!);

    const displayLoader = isNotNilOrEmpty(specificationId) && fetching;
    const showNotFoundSpec =
        isNotNilOrEmpty(specificationId) && !fetching && !foundSpecification;

    const onSuccess: SpecificationFormViewOnSuccess = useCallback(
        ({ formMode }) => {
            if (formMode === "EDITION") router.push("/specifications");
        },
        [router],
    );

    if (displayLoader)
        return (
            <Center>
                <Loader />
            </Center>
        );

    if (showNotFoundSpec)
        return <EditSpecificationNotFound id={specificationId!} />;

    return (
        <SpecificationFormView
            specification={foundSpecification}
            onSuccess={onSuccess}
        />
    );
};
