import { Anchor, Breadcrumbs as MantineBreadcrumbs } from "@mantine/core";
import Link from "next/link";
import type { FC, ReactNode } from "react";

export interface BreadcrumbModel {
    href: string;
    label: string;
}

interface BreadcrumbsProps {
    breadcrumbs: BreadcrumbModel[];
    children?: ReactNode;
}

const Breadcrumbs: FC<BreadcrumbsProps> = ({ breadcrumbs, children }) => {
    return (
        <MantineBreadcrumbs>
            {breadcrumbs.map((breadcrumb) => (
                <Anchor
                    key={breadcrumb.href}
                    href={breadcrumb.href}
                    component={Link}
                >
                    {breadcrumb.label}
                </Anchor>
            ))}
            {children}
        </MantineBreadcrumbs>
    );
};

export default Breadcrumbs;
