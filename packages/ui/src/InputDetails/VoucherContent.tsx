"use client";
import { FC } from "react";
import { PageableContent, PageableContentProps } from "./PageableContent";

export interface VoucherContentType extends FC<PageableContentProps> {}

const VoucherContent: VoucherContentType = (props) => PageableContent(props);

VoucherContent.displayName = "VoucherContent";

export default VoucherContent;
