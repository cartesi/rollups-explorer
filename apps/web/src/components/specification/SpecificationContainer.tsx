"use client";
import { Center, Loader } from "@mantine/core";
import { isNotNilOrEmpty } from "ramda-adjunct";
import { FC } from "react";
import { SpecificationFormView } from "./SpecificationFormView";
import { EditSpecificationNotFound } from "./components/EditSpecificationNotFound";
import { useSpecification } from "./hooks/useSpecification";
import { Specification } from "./types";

interface ContainerProps {
    specificationId?: Specification["id"];
}

export const SpecificationContainer: FC<ContainerProps> = ({
    specificationId,
}) => {
    const { getSpecification, fetching } = useSpecification();
    const foundSpecification = specificationId
        ? getSpecification(specificationId)
        : undefined;

    const displayLoader = isNotNilOrEmpty(specificationId) && fetching;
    const showNotFoundSpec =
        isNotNilOrEmpty(specificationId) && !fetching && !foundSpecification;

    if (displayLoader)
        return (
            <Center>
                <Loader />
            </Center>
        );

    if (showNotFoundSpec)
        return <EditSpecificationNotFound id={specificationId!} />;

    return <SpecificationFormView specification={foundSpecification} />;
};
