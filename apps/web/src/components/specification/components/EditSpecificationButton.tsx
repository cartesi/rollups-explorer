import { ActionIcon } from "@mantine/core";
import Link from "next/link";
import { FC } from "react";
import { TbEdit } from "react-icons/tb";

export const EditSpecificationButton: FC<{ id: string; iconSize?: number }> = ({
    id,
    iconSize = 21,
}) => {
    return (
        <ActionIcon
            variant="transparent"
            data-testid={`edit-specification-${id}`}
            component={Link}
            color="yellow"
            href={`/specifications/edit/${id}`}
        >
            <TbEdit size={iconSize} />
        </ActionIcon>
    );
};
