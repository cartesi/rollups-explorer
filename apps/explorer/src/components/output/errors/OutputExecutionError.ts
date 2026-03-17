import { pathOr } from "ramda";
import type {
    ReadContractErrorType,
    SimulateContractErrorType,
} from "wagmi/actions";

export type WagmiActionError =
    | ReadContractErrorType
    | SimulateContractErrorType;

type WagmiError = {
    type: "wagmi-error";
    error: WagmiActionError;
};

type SimpleError = {
    type: "error";
    message: string;
    shortMessage?: string;
};

type Params = WagmiError | SimpleError;

class OutputExecutionError {
    shortMessage: string = "";
    message: string = "Output execution failed!";

    constructor(params: Params) {
        switch (params.type) {
            case "error":
                this.setError(params.message, params.shortMessage);
                break;
            case "wagmi-error":
                this.setWagmiError(params.error);
                break;
            default:
                break;
        }
    }

    private setWagmiError(error: WagmiActionError) {
        const message = pathOr(this.message, ["shortMessage"], error);
        const shortMessage = pathOr(
            this.shortMessage,
            ["cause", "data", "errorName"],
            error,
        );

        this.setError(message, shortMessage);
    }

    private setError(message: string, shortMessage?: string) {
        this.message = message;
        this.shortMessage = shortMessage ?? "Something is not right!";
    }
}

export default OutputExecutionError;
