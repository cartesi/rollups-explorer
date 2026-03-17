"use client";
import { type FC } from "react";
import DepositFormBatch from "./DepositFormBatch";
import DepositFormSingle from "./DepositFormSingle";
import { type ERC1155DepositFormProps } from "./types";

export const ERC1155DepositForm: FC<ERC1155DepositFormProps> = (props) => {
    return (
        <>
            {props.mode === "single" ? (
                <DepositFormSingle
                    key="erc-1155-single"
                    application={props.application}
                    onSuccess={props.onSuccess}
                />
            ) : props.mode === "batch" ? (
                <DepositFormBatch
                    key="erc-1155-batch"
                    application={props.application}
                    onSuccess={props.onSuccess}
                />
            ) : null}
        </>
    );
};
