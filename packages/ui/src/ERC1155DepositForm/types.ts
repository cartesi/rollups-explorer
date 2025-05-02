import { TransactionFormSuccessData } from "../DepositFormTypes";
import { Application, RollupVersion } from "../commons/interfaces";

export interface ERC1155DepositFormProps {
    mode: "single" | "batch";
    tokens: string[];
    applications: Application[];
    isLoadingApplications: boolean;
    onSearchApplications: (
        appAddress: string,
        rollupVersion?: RollupVersion,
    ) => void;
    onSearchTokens: (tokenId: string) => void;
    onSuccess: (receipt: TransactionFormSuccessData) => void;
}
