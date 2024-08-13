import { TransactionFormSuccessData } from "../DepositFormTypes";

export interface ERC1155DepositFormProps {
    mode: "single" | "batch";
    tokens: string[];
    applications: string[];
    isLoadingApplications: boolean;
    onSearchApplications: (applicationId: string) => void;
    onSearchTokens: (tokenId: string) => void;
    onSuccess: (receipt: TransactionFormSuccessData) => void;
}
