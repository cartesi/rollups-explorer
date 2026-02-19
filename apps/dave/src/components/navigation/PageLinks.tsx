import { Group, Text } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import { pathBuilder } from "../../routes/routePathBuilder";
import classes from "./PageLinks.module.css";

const PageLinks: FC = () => {
    const path = usePathname();

    const links = [
        {
            name: "Home",
            href: pathBuilder.home(),
        },
        {
            name: "Specifications",
            href: pathBuilder.specifications(),
        },
    ];

    return (
        <Group justify="space-between" align="baseline">
            {links.map((link) => (
                <Group
                    gap={3}
                    key={link.name}
                    className={classes.linkGroup}
                    data-selected={path === link.href}
                >
                    <Text
                        component={Link}
                        href={link.href}
                        ff="monospace"
                        size="lg"
                    >
                        {link.name}
                    </Text>
                </Group>
            ))}
        </Group>
    );
};

export default PageLinks;
