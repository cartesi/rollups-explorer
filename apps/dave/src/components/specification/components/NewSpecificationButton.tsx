import { Button, type ButtonProps } from "@mantine/core";
import Link from "next/link";
import type { FC } from "react";
import { pathBuilder } from "../../../routes/routePathBuilder";

interface NewSpecificationButtonProps extends ButtonProps {
    btnText?: string;
}

export const NewSpecificationButton: FC<NewSpecificationButtonProps> = (
    props,
) => {
    const { btnText = "Create specification", ...rest } = props;
    return (
        <Button
            component={Link}
            href={pathBuilder.specificationsNew()}
            {...rest}
        >
            {btnText}
        </Button>
    );
};
