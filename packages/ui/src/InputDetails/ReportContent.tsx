"use client";
import { FC } from "react";
import { PageableContent, PageableContentProps } from "./PageableContent";

export interface ReportContentType extends FC<PageableContentProps> {}

const ReportContent: ReportContentType = (props) => PageableContent(props);

ReportContent.displayName = "ReportContent";

export default ReportContent;
