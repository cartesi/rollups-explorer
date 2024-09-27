"use client";
import { FC } from "react";
import { PageableContent, PageableContentProps } from "./PageableContent";

export interface NoticeContentType
    extends Omit<PageableContentProps, "outputType"> {}

const DISPLAY_NAME = "NoticeContent" as const;

const NoticeContent: FC<NoticeContentType> = (props) =>
    PageableContent({ ...props, outputType: DISPLAY_NAME });

NoticeContent.displayName = DISPLAY_NAME;

export default NoticeContent;
