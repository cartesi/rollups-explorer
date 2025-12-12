"use client";
import { FC } from "react";
import { PageableContent, PageableContentProps } from "./PageableContent";

export interface ReportContentType extends Omit<
    PageableContentProps,
    "outputType"
> {}

const DISPLAY_NAME = "ReportContent" as const;

const ReportContent: FC<ReportContentType> = (props) =>
    PageableContent({ ...props, outputType: DISPLAY_NAME });

ReportContent.displayName = DISPLAY_NAME;

export default ReportContent;
