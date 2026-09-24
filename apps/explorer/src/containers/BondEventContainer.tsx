"use client";
import { useBondEvent } from "@cartesi/react";
import { notFound } from "next/navigation";
import { isNotNil } from "ramda";
import { type FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { shortenHash } from "../lib/textUtils";
import { BondEventPage } from "../page/BondEventPage";
import { pathBuilder, type BondEventParams } from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";
import ContainerStack from "./ContainerStack";

export const BondEventContainer: FC<BondEventParams> = (params) => {
    const { data: event, isLoading } = useBondEvent(params);

    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: "/" },
        {
            title: params.application,
            href: pathBuilder.application(params),
        },
        {
            title: "Bonds",
            href: pathBuilder.bonds(params),
        },
        {
            title: `${shortenHash(params.txHash)} #${params.logIndex}`,
            href: pathBuilder.bondEvent(params),
        },
    ];

    if (!isLoading && !event) {
        return notFound();
    }

    return (
        <ContainerStack>
            <Hierarchy hierarchyConfig={hierarchyConfig} />
            {isLoading && <ContainerSkeleton />}
            {isNotNil(event) && (
                <BondEventPage application={params.application} event={event} />
            )}
        </ContainerStack>
    );
};
