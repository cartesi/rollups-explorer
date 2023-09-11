"use client";
import { FC } from "react";
import { PageableContent, PageableContentProps } from "./PageableContent";

export interface NoticeContentType extends FC<PageableContentProps> {}

const NoticeContent: NoticeContentType = (props) => PageableContent(props);

NoticeContent.displayName = "NoticeContent";

export default NoticeContent;
