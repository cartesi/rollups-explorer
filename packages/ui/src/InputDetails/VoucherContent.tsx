"use client";
import type { FC, ReactNode } from "react";
import { PageableContent, PageableContentProps } from "./PageableContent";

export interface VoucherContentType extends PageableContentProps {
    children: ReactNode;
}

const VoucherContent: FC<VoucherContentType> = (props) => {
    const { children, ...restProps } = props;

    return (
        <div>
            <PageableContent {...restProps as PageableContentProps} />
            {children}
        </div>
    )
};

VoucherContent.displayName = "VoucherContent" as const;

export default VoucherContent;
