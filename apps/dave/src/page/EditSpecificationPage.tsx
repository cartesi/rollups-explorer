import { Stack } from "@mantine/core";
import type { FC } from "react";
import { TbFileCode } from "react-icons/tb";
import PageTitle from "../components/layout/PageTitle";
import { SpecificationContainer } from "../components/specification/SpecificationContainer";

type Props = { specificationId: string };
export const EditSpecificationPage: FC<Props> = ({ specificationId }) => {
    return (
        <Stack>
            <PageTitle title="Edit Specifications" Icon={TbFileCode} />
            <SpecificationContainer specificationId={specificationId} />
        </Stack>
    );
};
