"use client";

import type { FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { SpecificationsPage } from "../page/SpecificationsPage";
import { pathBuilder } from "../routes/routePathBuilder";
import ContainerStack from "./ContainerStack";

export const SpecificationsContainer: FC = () => {
    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: pathBuilder.home() },
        { title: "Specifications", href: pathBuilder.specifications() },
    ];

    return (
        <ContainerStack>
            <Hierarchy hierarchyConfig={hierarchyConfig} />
            <SpecificationsPage />
        </ContainerStack>
    );
};
