import { FC } from "react";
import DepositFormBatch from "./DepositFormBatch";
import DepositFormSingle from "./DepositFormSingle";
import { ERC1155DepositFormProps } from "./types";

export const ERC1155DepositForm: FC<ERC1155DepositFormProps> = (props) => {
    return (
        <>
            {props.mode === "single" ? (
                <DepositFormSingle
                    tokens={props.tokens}
                    applications={props.applications}
                    isLoadingApplications={props.isLoadingApplications}
                    onSearchApplications={props.onSearchApplications}
                    onSearchTokens={props.onSearchTokens}
                    onSuccess={props.onSuccess}
                />
            ) : props.mode === "batch" ? (
                <DepositFormBatch
                    tokens={props.tokens}
                    applications={props.applications}
                    isLoadingApplications={props.isLoadingApplications}
                    onSearchApplications={props.onSearchApplications}
                    onSearchTokens={props.onSearchTokens}
                    onSuccess={props.onSuccess}
                />
            ) : null}
        </>
    );
};
