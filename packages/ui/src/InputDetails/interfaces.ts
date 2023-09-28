import InputContent from "./InputContent";
import NoticeContent from "./NoticeContent";
import ReportContent from "./ReportContent";
import VoucherContent from "./VoucherContent";

export interface StaticContentComponents {
    InputContent: typeof InputContent;
    VoucherContent: typeof VoucherContent;
    ReportContent: typeof ReportContent;
    NoticeContent: typeof NoticeContent;
}

export type SupportedContent = keyof StaticContentComponents;

export type OptionalContents = Partial<StaticContentComponents>;
