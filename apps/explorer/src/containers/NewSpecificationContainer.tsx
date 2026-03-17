"use client";

import type { FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { NewSpecificationPage } from "../page/NewSpecificationPage";
import { pathBuilder } from "../routes/routePathBuilder";
import ContainerStack from "./ContainerStack";

export const NewSpecificationContainer: FC = () => {
    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: pathBuilder.home() },
        { title: "Specifications", href: pathBuilder.specifications() },
        { title: "New", href: "" },
    ];

    return (
        <ContainerStack>
            <Hierarchy hierarchyConfig={hierarchyConfig} />
            <NewSpecificationPage />
        </ContainerStack>
    );
};
