import { ActionIcon, VisuallyHidden } from "@mantine/core";
import Link from "next/link";
import { type FC } from "react";
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
            role="link"
            href={`/specifications/edit/${id}`}
        >
            <VisuallyHidden>Edit Specification id {id}</VisuallyHidden>
            <TbEdit size={iconSize} />
        </ActionIcon>
    );
};
