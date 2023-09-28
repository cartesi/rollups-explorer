"use client";
import { FC } from "react";
import { PageableContent, PageableContentProps } from "./PageableContent";

export interface ReportContentType extends FC<PageableContentProps> {}

const DISPLAY_NAME = "ReportContent" as const;

const ReportContent: ReportContentType = (props) => {
    PageableContent.displayName = DISPLAY_NAME;
    return PageableContent(props);
};

ReportContent.displayName = DISPLAY_NAME;

export default ReportContent;
