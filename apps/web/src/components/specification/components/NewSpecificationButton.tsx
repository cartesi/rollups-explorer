import { Button, ButtonProps } from "@mantine/core";
import Link from "next/link";
import { FC } from "react";

interface NewSpecificationButtonProps extends ButtonProps {
    btnText?: string;
}

export const NewSpecificationButton: FC<NewSpecificationButtonProps> = (
    props,
) => {
    const { btnText = "Create specification", ...rest } = props;
    return (
        <Button component={Link} href="/specifications/new" {...rest}>
            {btnText}
        </Button>
    );
};
