import { Stack } from "@mantine/core";
import type { FC } from "react";
import { TbFileCode } from "react-icons/tb";
import PageTitle from "../components/layout/PageTitle";
import { SpecificationContainer } from "../components/specification/SpecificationContainer";

export const NewSpecificationPage: FC = () => {
    return (
        <Stack>
            <PageTitle title="Create a Specification" Icon={TbFileCode} />
            <SpecificationContainer />
        </Stack>
    );
};
