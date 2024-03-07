"use client";
import type { FC, ReactNode } from "react";
import { PageableContent, PageableContentProps } from "./PageableContent";

export interface VoucherContentType extends PageableContentProps {
    children?: ReactNode;
}

const DISPLAY_NAME = "VoucherContent" as const;

const VoucherContent: FC<VoucherContentType> = (props) => {
    const { children = null, ...restProps } = props;
    PageableContent.displayName = DISPLAY_NAME;

    return (
        <div>
            <PageableContent {...(restProps as PageableContentProps)} />
            {children}
        </div>
    );
};

VoucherContent.displayName = DISPLAY_NAME;

export default VoucherContent;
