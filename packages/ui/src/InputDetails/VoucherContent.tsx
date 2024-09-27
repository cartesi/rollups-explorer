"use client";
import type { FC, ReactNode } from "react";
import { PageableContent, PageableContentProps } from "./PageableContent";

export interface VoucherContentType
    extends Omit<PageableContentProps, "outputType"> {
    children?: ReactNode;
}

const DISPLAY_NAME = "VoucherContent" as const;

const VoucherContent: FC<VoucherContentType> = (props) =>
    PageableContent({ ...props, outputType: DISPLAY_NAME });

VoucherContent.displayName = DISPLAY_NAME;

export default VoucherContent;
