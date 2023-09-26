"use client";
import { FC } from "react";
import { PageableContent, PageableContentProps } from "./PageableContent";

export interface VoucherContentType extends FC<PageableContentProps> {}

const DISPLAY_NAME = "VoucherContent" as const;

const VoucherContent: VoucherContentType = (props) => {
    PageableContent.displayName = DISPLAY_NAME;
    return PageableContent(props);
};

VoucherContent.displayName = DISPLAY_NAME;

export default VoucherContent;
