"use client";
import { Stack } from "@mantine/core";
import { type FC } from "react";
import { TbFileCode } from "react-icons/tb";
import PageTitle from "../components/layout/PageTitle";
import { SpecificationListView } from "../components/specification/SpecificationListView";

export const SpecificationsPage: FC = () => {
    return (
        <Stack>
            <PageTitle Icon={TbFileCode} title="Specifications" />
            <SpecificationListView />
        </Stack>
    );
};
