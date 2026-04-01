"use client";
import { useApplication } from "@cartesi/wagmi";
import { Anchor, Stack, Title } from "@mantine/core";
import Link from "next/link";
import { isNil, pathOr } from "ramda";
import type { FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { OutputsPage } from "../page/OutputsPage";
import { pathBuilder } from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";
import ContainerStack from "./ContainerStack";

export type OutputsContainerProps = {
    application: string;
    descending?: boolean;
    limit?: number;
    offset?: number;
};

export const OutputsContainer: FC<OutputsContainerProps> = (props) => {
    const {
        data: application,
        isLoading,
        error,
    } = useApplication({
        application: props.application,
    });
    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: "/" },
        {
            title: props.application,
            href: pathBuilder.application(props),
        },
        {
            title: "Outputs",
            href: pathBuilder.outputs(props),
        },
    ];

    return (
        <ContainerStack>
            <Hierarchy hierarchyConfig={hierarchyConfig} />

            {isNil(application) && isLoading ? (
                <ContainerSkeleton />
            ) : !isNil(application) ? (
                <OutputsPage
                    application={
                        application?.applicationAddress ?? props.application
                    }
                    limit={props.limit ?? 10}
                />
            ) : (
                <Stack align="center" justify="center" pt="xl">
                    <Title order={2}>
                        {pathOr(
                            `Application ${props.application} not found`,
                            ["details"],
                            error,
                        )}
                    </Title>
                    <Anchor component={Link} href={pathBuilder.home()}>
                        Go back to Home
                    </Anchor>
                </Stack>
            )}
        </ContainerStack>
    );
};
