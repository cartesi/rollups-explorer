"use client";

import type { FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { EditSpecificationPage } from "../page/EditSpecificationPage";
import { pathBuilder } from "../routes/routePathBuilder";
import ContainerStack from "./ContainerStack";

type Props = { id: string };
export const EditSpecificationContainer: FC<Props> = ({ id }) => {
    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: pathBuilder.home() },
        { title: "Specifications", href: pathBuilder.specifications() },
        {
            title: "Edit",
            href: pathBuilder.specificationsEdit(id),
        },
    ];

    return (
        <ContainerStack>
            <Hierarchy hierarchyConfig={hierarchyConfig} />
            <EditSpecificationPage specificationId={id} />
        </ContainerStack>
    );
};
