"use client";
import type {
    DelegateCallVoucher,
    GetOutputReturnType,
    Notice,
    Output,
    Voucher,
} from "@cartesi/viem";
import type { DecoderType } from "../types";

export type VoucherOutput = Omit<Output, "decodedData"> & {
    decodedData: Voucher | DelegateCallVoucher;
};

export type VoucherContentProps = {
    output: VoucherOutput;
    application: string;
    decoderType: DecoderType;
    title?: string;
};

export type OutputViewProps = {
    displayAs?: DecoderType;
    output: GetOutputReturnType;
    application: string;
};

export type NoticeContentProps = {
    decodedData: Notice;
    decoderType: DecoderType;
};
