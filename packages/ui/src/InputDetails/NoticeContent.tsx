"use client";
import { FC } from "react";
import { PageableContent, PageableContentProps } from "./PageableContent";

export interface NoticeContentType extends FC<PageableContentProps> {}

const DISPLAY_NAME = "NoticeContent" as const;

const NoticeContent: NoticeContentType = (props) => {
    PageableContent.displayName = DISPLAY_NAME;
    return PageableContent(props);
};

NoticeContent.displayName = DISPLAY_NAME;

export default NoticeContent;
