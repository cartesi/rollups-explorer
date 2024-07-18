import { Button } from "@mantine/core";
import Link from "next/link";
import { FC } from "react";

export const NewSpecificationButton: FC<{ btnText?: string }> = ({
    btnText = "New",
}) => (
    <Button component={Link} href="/specifications/new">
        {btnText}
    </Button>
);
